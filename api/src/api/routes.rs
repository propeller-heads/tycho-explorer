use axum::{
    extract::State,
    routing::{get, post},
    Json, Router,
};
use num_bigint::BigUint;
use serde::{Deserialize, Serialize};
use serde_json::json;
use tracing::info;

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
    amount: String,  // Accept as string to preserve precision
}

#[derive(Debug, Serialize)]
struct SimulationResponse {
    success: bool,
    input_amount: String,  // Keep as string for exact representation
    output_amount: String, // Return as string to preserve precision
    gas_estimate: String,  // Serialize BigUint as string
}

// Use Result with your existing ApiError
async fn simulate_transaction(
    State(state): State<SimulationState>,
    Json(request): Json<SimulationRequest>,
) -> Result<Json<SimulationResponse>, ApiError> {
    // Log incoming request
    info!("=== SIMULATE REQUEST ===");
    info!("Sell Token: {}", request.sell_token);
    info!("Pools: {:?}", request.pools);
    info!("Amount: {}", request.amount);
    
    // Parse amount from string, handling decimal notation
    let (integer_part, decimal_part) = if let Some(dot_pos) = request.amount.find('.') {
        let (int_str, dec_str) = request.amount.split_at(dot_pos);
        (int_str, &dec_str[1..]) // Skip the dot
    } else {
        (request.amount.as_str(), "")
    };
    
    // Parse integer part as BigUint
    let amount_biguint = BigUint::parse_bytes(integer_part.as_bytes(), 10)
        .ok_or_else(|| ApiError::InvalidInput("Invalid amount format".to_string()))?;

    let mut current_amount = None;
    let mut total_gas = BigUint::from(0u64);
    let mut next_sell_token = request.sell_token;
    let mut decimals = 0;

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
                if current_amount.is_none() {
                    // Calculate 10^decimals using BigUint arithmetic
                    let base = BigUint::from(10u32);
                    let token_multiplier = base.pow(sell_token.decimals as u32);
                    
                    // Convert integer part to smallest unit
                    let mut final_amount = amount_biguint.clone() * &token_multiplier;
                    
                    // Handle decimal part if present
                    if !decimal_part.is_empty() {
                        let decimal_places = decimal_part.len();
                        if decimal_places > sell_token.decimals as usize {
                            return Err(ApiError::InvalidInput(
                                format!("Too many decimal places. Token supports {} decimals", sell_token.decimals)
                            ));
                        }
                        
                        // Parse decimal part and adjust for token decimals
                        if let Some(decimal_value) = BigUint::parse_bytes(decimal_part.as_bytes(), 10) {
                            let decimal_multiplier = base.pow((sell_token.decimals as usize - decimal_places) as u32);
                            final_amount += decimal_value * decimal_multiplier;
                        }
                    }
                    
                    current_amount = Some(final_amount);
                    
                    info!("input amount: {}", request.amount);
                    info!("sell_token decimals: {}", sell_token.decimals);
                    info!("initial amount (with decimals): {}", current_amount.as_ref().unwrap());
                }
                
                info!("=== POOL SIMULATION ===");
                info!("Pool: {}", pool_address);
                info!("Sell Token: {} (decimals: {})", sell_token.address, sell_token.decimals);
                info!("Buy Token: {} (decimals: {})", buy_token.address, buy_token.decimals);
                info!("Input Amount: {}", current_amount.as_ref().unwrap());
                
                let result = pool
                    .get_amount_out(current_amount.unwrap(), &sell_token, &buy_token)
                    .map_err(|e| ApiError::SimulationError(format!("Simulation error: {}", e)))?;
                
                info!("Output Amount: {}", result.amount);
                info!("Gas Used: {}", result.gas);

                // Assuming result is a tuple of (amount_out, gas)
                current_amount = Some(result.amount);
                total_gas += result.gas;
                next_sell_token = buy_token.address.to_string();
                decimals = buy_token.decimals;
            }
            None => {
                return Err(ApiError::NotFound(format!(
                    "Pool not found: {}",
                    pool_address
                )));
            }
        }
    }

    let amount_out_raw = current_amount
        .ok_or_else(|| ApiError::SimulationError("No output amount calculated".to_string()))?;
    
    info!("=== FINAL CALCULATION ===");
    info!("Raw output amount: {}", amount_out_raw);
    info!("Output decimals: {}", decimals);
    
    // Convert output amount back to human-readable format with proper decimals
    let divisor = BigUint::from(10u32).pow(decimals as u32);
    let integer_part = &amount_out_raw / &divisor;
    let remainder = &amount_out_raw % &divisor;
    
    // Format output with decimal places
    let output_amount_str = if remainder == BigUint::from(0u32) {
        integer_part.to_string()
    } else {
        // Pad remainder with leading zeros if needed
        let remainder_str = format!("{:0>width$}", remainder.to_string(), width = decimals as usize);
        // Trim trailing zeros
        let trimmed = remainder_str.trim_end_matches('0');
        if trimmed.is_empty() {
            integer_part.to_string()
        } else {
            format!("{}.{}", integer_part, trimmed)
        }
    };
    
    info!("Final output amount: {}", output_amount_str);
    info!("Exchange rate: {} -> {}", request.amount, output_amount_str);

    Ok(Json(SimulationResponse {
        success: true,
        input_amount: request.amount,
        output_amount: output_amount_str,
        gas_estimate: total_gas.to_string(),
    }))
}
