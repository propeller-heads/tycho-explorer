mod api;
mod errors;
mod simulation;
mod utils;

use api::start_api_server;
use clap::Parser;
use dotenv::dotenv;
use futures::future::select_all;
use simulation::state::SimulationState;
use std::{env, str::FromStr};
use tokio::sync::mpsc;
use tycho_simulation::tycho_core::models::Chain;
use utils::setup::setup_tracing;

#[derive(Parser)]
struct Cli {
    /// The tvl threshold to filter the graph by
    #[arg(short, long, default_value_t = 1000.0)]
    tvl_threshold: f64,
    /// The tvl buffer before removing a pool
    #[arg(short = 'b', long, default_value_t = 10.0)]
    tvl_buffer: f64,
    /// The target blockchain
    #[clap(long, default_value = "ethereum")]
    pub chain: String,
    /// API server port
    #[clap(long, default_value = "3000")]
    pub port: u16,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();
    setup_tracing();

    let cli = Cli::parse();
    let chain =
        Chain::from_str(&cli.chain).unwrap_or_else(|_| panic!("Unknown chain {}", cli.chain));

    let tycho_url = env::var("TYCHO_URL").unwrap_or_else(|_| {
        utils::setup::get_default_url(&chain)
            .unwrap_or_else(|| panic!("Unknown URL for chain {}", cli.chain))
    });

    let tycho_api_key = env::var("TYCHO_API_KEY").unwrap_or_else(|_| "sampletoken".to_string());

    // Create shared state for the simulation
    let simulation_state = SimulationState::new();

    // Create communication channels
    let (simulation_tx, simulation_rx) = mpsc::channel(32);

    // Start the API server
    let api_server = start_api_server(cli.port, simulation_state.clone(), simulation_tx.clone());

    // Start the simulation processor
    let simulation_task = simulation::start_simulation_processor(
        simulation_state.clone(),
        simulation_tx,
        simulation_rx,
        &tycho_url,
        &tycho_api_key,
        cli.tvl_threshold,
        cli.tvl_buffer,
        chain,
    );

    let tasks = vec![api_server, simulation_task];

    // Wait for all tasks to complete
    let (result, _, _) = select_all(tasks).await;

    let _ = result?;
    Ok(())
}
