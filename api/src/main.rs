mod api;
mod errors;
mod simulation;
mod utils;

use api::start_api_server;
use clap::Parser;
use dotenv::dotenv;
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

    // Check RPC_URL for Ethereum chain
    if chain == Chain::Ethereum {
        match env::var("RPC_URL") {
            Ok(rpc_url) => {
                info!("RPC_URL configured for Ethereum: {}", rpc_url);
            }
            Err(_) => {
                panic!("RPC_URL environment variable is required for Ethereum chain");
            }
        }
    }

    let tycho_url = if cli.tycho_url.is_empty() {
        panic!("TYCHO_URL cannot be empty")
    } else {
        &cli.tycho_url
    };

    let tycho_api_key = env::var("TYCHO_API_KEY").unwrap_or_else(|_| panic!("TYCHO_API_KEY environment variable not set"));

    // Create shared state for the simulation
    let simulation_state = SimulationState::new();
    info!("Created simulation state");

    // Create initial channel for API server
    let (api_tx, _api_rx) = mpsc::channel(32);
    
    // Start API server (runs forever, no retry)
    let api_handle = start_api_server(cli.port, simulation_state.clone(), api_tx.clone());
    info!("API server started on port {}", cli.port);
    
    // Restart loop only for simulation processor
    let mut restart_count = 0u32;
    loop {
        if restart_count > 7 {
            panic!("SIMULATION PROCESSOR RESTART COUNT > 7")
        }
        restart_count += 1;
        
        info!("Starting simulation processor (attempt #{})", restart_count);
        
        // Create fresh channels for simulation processor
        let (simulation_tx, simulation_rx) = mpsc::channel(32);
        
        let sim_result = start_simulation_processor(
            simulation_state.clone(),
            simulation_tx,
            simulation_rx,
            &tycho_url,
            &tycho_api_key,
            cli.tvl_threshold,
            cli.tvl_buffer,
            chain,
        ).await;
        
        // Log what happened
        match sim_result {
            Ok(Ok(())) => error!("Simulation processor completed normally (unexpected)"),
            Ok(Err(e)) => error!("Simulation processor failed with error: {:?}", e),
            Err(e) => error!("Simulation processor panicked: {:?}", e),
        }
        
        // Check if API server is still running
        if api_handle.is_finished() {
            error!("API server has died - exiting");
            break;
        }
        
        error!("Restarting simulation processor in 15 seconds (restart #{})...", restart_count);
        tokio::time::sleep(Duration::from_secs(15)).await;
    }
    Ok(())
}
