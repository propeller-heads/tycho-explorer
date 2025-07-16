pub mod routes;
pub mod ws;

use axum::Router;
use std::net::SocketAddr;
use tokio::{sync::mpsc, task::JoinHandle};
use tower_http::{
    cors::{Any, CorsLayer},
    trace::TraceLayer,
};
use tracing::info;
use tycho_simulation::protocol::models::Update as BlockUpdate;

use crate::simulation::state::SimulationState;

use self::routes::get_routes;

pub fn start_api_server(
    port: u16,
    state: SimulationState,
    _tx: mpsc::Sender<BlockUpdate>,
) -> JoinHandle<anyhow::Result<()>> {
    tokio::spawn(async move {
        // Set up CORS
        let cors = CorsLayer::new()
            .allow_origin(Any)
            .allow_methods(Any)
            .allow_headers(Any);

        // Build the API routes
        let app = Router::new()
            .merge(get_routes(state))
            .layer(TraceLayer::new_for_http())
            .layer(cors);

        // Bind to address
        let addr = SocketAddr::from(([0, 0, 0, 0], port));
        info!("API server listening on {}", addr);

        // Create a TCP socket with SO_REUSEADDR to allow immediate port reuse
        let socket = tokio::net::TcpSocket::new_v4()?;
        socket.set_reuseaddr(true)?;
        socket.bind(addr)?;
        let listener = socket.listen(1024)?;

        // Start the server using the new approach
        axum::serve(listener, app).await?;

        anyhow::Result::<()>::Ok(())
    })
}
