mod api;
mod errors;
mod simulation;
mod utils;

use api::start_api_server;
use clap::Parser;
use dotenv::dotenv;
use futures::future::select_all;
use simulation::{state::SimulationState, start_simulation_processor};
use std::{env, str::FromStr, time::Duration};
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

    // Simple restart loop - these tasks should run forever
    let mut restart_count = 0u32;
    loop {
        if restart_count > 3 {
            panic!("RESTART COUNT > 3")
        }
        restart_count += 1;
        
        // Create fresh channels
        let (simulation_tx, simulation_rx) = mpsc::channel(32);
        
        // Start both tasks
        info!("Starting services (attempt #{})", restart_count);
        let tasks = vec![
            start_api_server(cli.port, simulation_state.clone(), simulation_tx.clone()),
            start_simulation_processor(
                simulation_state.clone(),
                simulation_tx,
                simulation_rx,
                &tycho_url,
                &tycho_api_key,
                cli.tvl_threshold,
                cli.tvl_buffer,
                chain,
            ),
        ];
        
        // Wait for any task to complete (shouldn't happen)
        let (result, task_index, _) = select_all(tasks).await;
        
        let task_name = if task_index == 0 { "API Server" } else { "Simulation Processor" };
        
        // Log what happened for debugging
        match result {
            Ok(Ok(())) => error!("{} completed normally (unexpected for long-running task)", task_name),
            Ok(Err(e)) => error!("{} failed with error: {:?}", task_name, e),
            Err(e) => error!("{} panicked: {:?}", task_name, e),
        }
        
        error!("Restarting all services in 5 seconds (restart #{})...", restart_count);
        
        // Channels are already moved into the tasks and will be dropped when tasks complete
        // Additional cleanup happens naturally when tasks are dropped
        
        tokio::time::sleep(Duration::from_secs(5)).await;
    }
}
