use std::sync::Once;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};
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
