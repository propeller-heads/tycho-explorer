use axum::{
    Json, Router,
    extract::State,
    routing::{get, post},
};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};

use crate::simulation::state::SimulationState;

use super::ws::ws_handler;

pub fn get_routes(state: SimulationState) -> Router {
    Router::new()
        .route("/", get(health_check))
        .route("/api/simulate", post(simulate_transaction))
        .route("/ws", get(ws_handler))
        .with_state(state)
}

async fn health_check() -> Json<serde_json::Value> {
    Json(json!({
        "status": "ok",
        "service": "simulation-api",
    }))
}

#[derive(Debug, Deserialize)]
struct SimulationRequest {
    sell_token: String,
    pools: Vec<String>,
    amount: String,
}

#[derive(Debug, Serialize)]
struct SimulationResponse {
    success: bool,
    input_amount: String,
    output_amount: String,
    gas_estimate: u64,
}

async fn simulate_transaction(
    State(state): State<SimulationState>, // State is injected from the API server
    Json(request): Json<SimulationRequest>, // User only provides swap parameters
) -> Json<Value> {
    // Use the injected state for simulation
    // let simulation_result = perform_simulation(&state, &request).await;
    // Return result
    todo!()
}
