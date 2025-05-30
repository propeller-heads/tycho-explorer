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
use tracing::{info, error};

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
    /// Tycho server URL
    #[clap(long)]
    pub tycho_url: String,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();
    setup_tracing();

    info!("Starting tycho-api...");

    let cli = Cli::parse();
    info!("CLI args: chain={}, port={}, tvl_threshold={}, tvl_buffer={}, tycho_url={}", 
        cli.chain, cli.port, cli.tvl_threshold, cli.tvl_buffer, cli.tycho_url);
    
    let chain = Chain::from_str(&cli.chain).unwrap_or_else(|_| panic!("Unknown chain {}", cli.chain));

    let tycho_url = if cli.tycho_url.is_empty() {
        panic!("TYCHO_URL cannot be empty")
    } else {
        &cli.tycho_url
    };

    let tycho_api_key = env::var("TYCHO_API_KEY").unwrap_or_else(|_| panic!("TYCHO_API_KEY environment variable not set"));

    // Create shared state for the simulation
    let simulation_state = SimulationState::new();
    info!("Created simulation state");

    // Create communication channels
    let (simulation_tx, simulation_rx) = mpsc::channel(32);
    info!("Created communication channels");

    // Start the API server
    info!("Starting API server on port {}", cli.port);
    let api_server = start_api_server(cli.port, simulation_state.clone(), simulation_tx.clone());

    // Start the simulation processor
    info!("Starting simulation processor...");
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
    info!("All tasks started, waiting for completion...");

    // Wait for all tasks to complete
    let (result, task_index, remaining) = select_all(tasks).await;
    
    match &result {
        Ok(_) => info!("Task {} completed successfully", task_index),
        Err(e) => error!("Task {} failed with error: {}", task_index, e),
    }
    
    // Log remaining tasks
    info!("Shutting down {} remaining tasks", remaining.len());

    let _ = result?;
    Ok(())
}
