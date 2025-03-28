pub mod state;

use futures::StreamExt;
use tokio::{sync::mpsc, task::JoinHandle};
use tracing::info;
use tycho_simulation::{
    evm::{
        engine_db::tycho_db::PreCachedDB,
        protocol::{
            filters::{balancer_pool_filter, uniswap_v4_pool_with_hook_filter},
            uniswap_v2::state::UniswapV2State,
            uniswap_v3::state::UniswapV3State,
            uniswap_v4::state::UniswapV4State,
            vm::state::EVMPoolState,
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
    mut builder: ProtocolStreamBuilder,
    chain: &Chain,
    tvl_filter: ComponentFilter,
) -> ProtocolStreamBuilder {
    match chain {
        Chain::Ethereum => {
            builder = builder
                .exchange::<UniswapV2State>("uniswap_v2", tvl_filter.clone(), None)
                .exchange::<UniswapV3State>("uniswap_v3", tvl_filter.clone(), None)
                .exchange::<EVMPoolState<PreCachedDB>>(
                    "vm:balancer_v2",
                    tvl_filter.clone(),
                    Some(balancer_pool_filter),
                )
                .exchange::<UniswapV4State>(
                    "uniswap_v4",
                    tvl_filter.clone(),
                    Some(uniswap_v4_pool_with_hook_filter),
                );
        }
        Chain::Base => {
            builder = builder
                .exchange::<UniswapV2State>("uniswap_v2", tvl_filter.clone(), None)
                .exchange::<UniswapV3State>("uniswap_v3", tvl_filter.clone(), None)
                .exchange::<UniswapV4State>(
                    "uniswap_v4",
                    tvl_filter.clone(),
                    Some(uniswap_v4_pool_with_hook_filter),
                )
        }
        Chain::ZkSync | Chain::Starknet | Chain::Arbitrum => {}
    }
    builder
}

pub fn start_simulation_processor(
    simulation_state: SimulationState,
    tx: mpsc::Sender<BlockUpdate>,
    rx: mpsc::Receiver<BlockUpdate>,
    tycho_url: &str,
    tycho_api_key: &str,
    tvl_threshold: f64,
    tvl_buffer: f64,
    chain: Chain,
) -> JoinHandle<anyhow::Result<()>> {
    let tycho_url = tycho_url.to_string();
    let tycho_api_key = tycho_api_key.to_string();

    tokio::spawn(async move {
        // Start the client task to process messages from Tycho
        let client_task = tokio::spawn(async move {
            let all_tokens = load_all_tokens(
                tycho_url.as_str(),
                false,
                Some(tycho_api_key.as_str()),
                chain,
                None,
                Some(1),
            )
            .await;
            info!("Loaded {} tokens", all_tokens.len());

            let tvl_filter =
                ComponentFilter::with_tvl_range(tvl_threshold - tvl_buffer, tvl_threshold);
            let mut protocol_stream = register_exchanges(
                ProtocolStreamBuilder::new(&tycho_url, chain),
                &chain,
                tvl_filter,
            )
            .auth_key(Some(tycho_api_key.clone()))
            .skip_state_decode_failures(true)
            .set_tokens(all_tokens)
            .await
            .build()
            .await
            .expect("Failed building protocol stream");

            // Loop through block updates
            while let Some(msg) = protocol_stream.next().await {
                if let Ok(update) = msg {
                    tx.send(update).await.expect("Failed to send update");
                }
            }

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
