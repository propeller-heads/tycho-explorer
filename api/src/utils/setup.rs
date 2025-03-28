use std::sync::Once;
use tracing_subscriber::{EnvFilter, layer::SubscriberExt, util::SubscriberInitExt};
use tycho_simulation::tycho_core::models::Chain;

static INIT: Once = Once::new();

pub fn setup_tracing() {
    INIT.call_once(|| {
        tracing_subscriber::registry()
            .with(EnvFilter::try_from_default_env().unwrap_or_else(|_| {
                "info,tower_http=debug,axum::rejection=trace,simulation_api=debug".into()
            }))
            .with(tracing_subscriber::fmt::layer())
            .init();
    });
}

pub fn get_default_url(chain: &Chain) -> Option<String> {
    match chain {
        Chain::Ethereum => Some("tycho-beta.propellerheads.xyz".to_string()),
        Chain::Base => Some("tycho-base-beta.propellerheads.xyz".to_string()),
        Chain::ZkSync => None,
        Chain::Starknet => None,
        Chain::Arbitrum => None,
    }
}
