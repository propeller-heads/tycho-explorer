pub mod state;

use futures::StreamExt;
use tokio::{sync::mpsc, task::JoinHandle};
use tracing::{info, debug, error};
use tycho_simulation::{
    evm::{
        engine_db::tycho_db::PreCachedDB,
        protocol::{
            filters::{balancer_pool_filter, uniswap_v4_pool_with_hook_filter},
            uniswap_v2::state::UniswapV2State,
            uniswap_v3::state::UniswapV3State,
            uniswap_v4::state::UniswapV4State,
            pancakeswap_v2::state::PancakeswapV2State,
            ekubo::state::EkuboState,
            vm::state::EVMPoolState,
            filters::{curve_pool_filter}
        },
        stream::ProtocolStreamBuilder,
    },
    protocol::models::BlockUpdate,
    tycho_client::feed::component_tracker::ComponentFilter,
    tycho_core::models::Chain,
    utils::load_all_tokens,
};

use self::state::SimulationState;

fn register_exchanges(
    mut protocol_stream: ProtocolStreamBuilder,
    chain: &Chain,
    tvl_filter: ComponentFilter,
) -> ProtocolStreamBuilder {
    match chain {
        Chain::Ethereum => {
            protocol_stream = protocol_stream
                .exchange::<UniswapV2State>("uniswap_v2", tvl_filter.clone(), None)
                .exchange::<UniswapV2State>("sushiswap_v2", tvl_filter.clone(), None)
                .exchange::<PancakeswapV2State>("pancakeswap_v2", tvl_filter.clone(), None)
                .exchange::<UniswapV3State>("uniswap_v3", tvl_filter.clone(), None)
                .exchange::<UniswapV3State>("pancakeswap_v3", tvl_filter.clone(), None)
                .exchange::<EVMPoolState<PreCachedDB>>(
                    "vm:curve",
                    tvl_filter.clone(),
                    Some(curve_pool_filter),
                )
                .exchange::<EVMPoolState<PreCachedDB>>(
                    "vm:balancer_v2",
                    tvl_filter.clone(),
                    Some(balancer_pool_filter),
                )
                .exchange::<UniswapV4State>(
                    "uniswap_v4",
                    tvl_filter.clone(),
                    Some(uniswap_v4_pool_with_hook_filter),
                )
                .exchange::<EkuboState>("ekubo_v2", tvl_filter.clone(), None);
        }
        Chain::Base => {
            protocol_stream = protocol_stream
                .exchange::<UniswapV2State>("uniswap_v2", tvl_filter.clone(), None)
                .exchange::<UniswapV3State>("uniswap_v3", tvl_filter.clone(), None)
                .exchange::<UniswapV4State>(
                    "uniswap_v4",
                    tvl_filter.clone(),
                    Some(uniswap_v4_pool_with_hook_filter),
                )
        }
        Chain::Unichain => {
            protocol_stream = protocol_stream
                .exchange::<UniswapV2State>("uniswap_v2", tvl_filter.clone(), None)
                .exchange::<UniswapV3State>("uniswap_v3", tvl_filter.clone(), None)
                .exchange::<UniswapV4State>(
                    "uniswap_v4",
                    tvl_filter.clone(),
                    Some(uniswap_v4_pool_with_hook_filter),
                )
        }
        _ => {}
    }
    protocol_stream
}

#[allow(clippy::too_many_arguments)]
pub fn start_simulation_processor(
    simulation_state: SimulationState,
    tx: mpsc::Sender<BlockUpdate>,
    rx: mpsc::Receiver<BlockUpdate>,
    tycho_url: &str,
    tycho_api_key: &str,
    tvl_threshold: f64,
    _tvl_buffer: f64,
    chain: Chain,
) -> JoinHandle<anyhow::Result<()>> {
    let tycho_url = tycho_url.to_string();
    let tycho_api_key = tycho_api_key.to_string();

    tokio::spawn(async move {
        info!("Simulation processor task started");
        
        // Start the client task to process messages from Tycho
        let client_task = tokio::spawn(async move {
            info!("Starting Tycho client task");
            info!("Connecting to Tycho URL: {}", tycho_url);
            info!("Chain: {:?}", chain);
            
            debug!("Loading tokens from Tycho...");
            let all_tokens = load_all_tokens(
                tycho_url.as_str(),
                false,
                Some(tycho_api_key.as_str()),
                chain,
                None,
                Some(1),
            )
            .await;
            info!("Successfully loaded {} tokens", all_tokens.len());

            let tvl_filter =
                ComponentFilter::with_tvl_range(0.0, tvl_threshold);
            info!("TVL filter: remove: {}, add: {}", 0.0, tvl_threshold);
            
            debug!("Building protocol stream...");
            let protocol_stream_builder = register_exchanges(
                ProtocolStreamBuilder::new(&tycho_url, chain),
                &chain,
                tvl_filter,
            )
            .auth_key(Some(tycho_api_key.clone()))
            .skip_state_decode_failures(true)
            .set_tokens(all_tokens)
            .await;
            
            info!("Building protocol stream...");
            let mut protocol_stream = match protocol_stream_builder.build().await {
                Ok(stream) => {
                    info!("Successfully built protocol stream");
                    stream
                },
                Err(e) => {
                    error!("Failed to build protocol stream: {}", e);
                    return Err(anyhow::anyhow!("Failed to build protocol stream: {}", e));
                }
            };

            info!("Starting to process block updates...");
            // Loop through block updates
            let mut update_count = 0;
            while let Some(msg) = protocol_stream.next().await {
                match msg {
                    Ok(update) => {
                        update_count += 1;
                        debug!("Received block update #{}", update_count);
                        if let Err(e) = tx.send(update).await {
                            error!("Failed to send update: {}", e);
                            break;
                        }
                    },
                    Err(e) => {
                        error!("Error receiving update: {}", e);
                    }
                }
            }
            
            info!("Protocol stream ended after {} updates", update_count);
            anyhow::Result::<()>::Ok(())
        });

        // Start the state manager task to handle incoming updates
        let state_task = tokio::spawn(async move {
            let mut receiver = rx;
            while let Some(update) = receiver.recv().await {
                simulation_state.update(update).await;
            }
            anyhow::Result::<()>::Ok(())
        });

        // Wait for both tasks
        let _ = tokio::try_join!(client_task, state_task)?;

        anyhow::Result::<()>::Ok(())
    })
}
