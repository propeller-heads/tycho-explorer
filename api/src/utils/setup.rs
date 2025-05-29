use std::sync::Once;
use std::env;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};
use tycho_simulation::tycho_core::models::Chain;

static INIT: Once = Once::new();

pub fn setup_tracing() {
    INIT.call_once(|| {
        tracing_subscriber::registry()
            .with(EnvFilter::try_from_default_env().unwrap_or_else(|_| {
                "info,tower_http=debug,axum::rejection=trace,simulation_api=debug".into()
            }))
            .with(tracing_subscriber::fmt::layer().with_ansi(false))
            .init();
    });
}

pub fn get_default_url(chain: &Chain) -> Option<String> {
    match chain {
        Chain::Ethereum => env::var("TYCHO_ETHEREUM_URL").ok(),
        Chain::Base => env::var("TYCHO_BASE_URL").ok(),
        Chain::Unichain => env::var("TYCHO_UNICHAIN_URL").ok(),
        Chain::ZkSync => None,
        Chain::Starknet => None,
        Chain::Arbitrum => None,
    }
}
