use axum::{
    extract::State,
    routing::{get, post},
    Json, Router,
};
use num_bigint::BigUint;
use serde::{Deserialize, Serialize};
use serde_json::json;

use crate::errors::ApiError;
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
    gas_estimate: BigUint,
}

// Use Result with your existing ApiError
async fn simulate_transaction(
    State(state): State<SimulationState>,
    Json(request): Json<SimulationRequest>,
) -> Result<Json<SimulationResponse>, ApiError> {
    // Parse amount
    let input_amount = request
        .amount
        .parse::<BigUint>()
        .map_err(|_| ApiError::BadRequest("Invalid amount format".to_string()))?;

    let mut current_amount = input_amount;
    let mut total_gas = BigUint::from(0u64);
    let mut next_sell_token = request.sell_token;

    for pool_address in request.pools.iter() {
        let (component, pool_state) = state.get_pool_state(pool_address).await;

        match pool_state {
            Some(pool) => {
                let sell_token;
                let buy_token;
                match component {
                    Some(component) => {
                        if component.tokens[0].address.to_string() == next_sell_token {
                            sell_token = component.tokens[0].clone();
                            buy_token = component.tokens[1].clone();
                        } else {
                            sell_token = component.tokens[1].clone();
                            buy_token = component.tokens[0].clone();
                        }
                    }
                    None => {
                        return Err(ApiError::NotFound(format!(
                            "Component not found: {}",
                            pool_address
                        )));
                    }
                }
                let result = pool
                    .get_amount_out(current_amount, &sell_token, &buy_token)
                    .map_err(|e| ApiError::SimulationError(format!("Simulation error: {}", e)))?;

                // Assuming result is a tuple of (amount_out, gas)
                current_amount = result.amount;
                total_gas += result.gas;
                next_sell_token = buy_token.address.to_string();
            }
            None => {
                return Err(ApiError::NotFound(format!(
                    "Pool not found: {}",
                    pool_address
                )));
            }
        }
    }

    Ok(Json(SimulationResponse {
        success: true,
        input_amount: request.amount,
        output_amount: current_amount.to_string(),
        gas_estimate: total_gas,
    }))
}
