use std::collections::HashMap;

use axum::{
    extract::{State, WebSocketUpgrade},
    response::IntoResponse,
};
use futures_util::{SinkExt, StreamExt};
use serde::Serialize;
use tokio::sync::broadcast;
use tracing::{error, info};
use tycho_simulation::{protocol::models::BlockUpdate, protocol::models::ProtocolComponent};

use crate::simulation::state::SimulationState;

// Define your custom update struct
#[derive(Serialize, Clone)]
struct ClientUpdate {
    block_number: u64,
    new_pairs: HashMap<String, ProtocolComponent>,
    spot_prices: HashMap<String, f64>,
    tvl_updates: HashMap<String, f64>,
}

impl From<BlockUpdate> for ClientUpdate {
    fn from(update: BlockUpdate) -> Self {
        // Extract spot prices from states
        let spot_prices = HashMap::new();
        // for (address, state) in &update.states {
        //     if let Some(price) = state.spot_price() {
        //         spot_prices.insert(address.clone(), price);
        //     }
        // }
        let mut tvl_updates = HashMap::new();
        for (address, _) in &update.states {
            tvl_updates.insert(address.clone(), 0 as f64);
        }

        ClientUpdate {
            block_number: update.block_number,
            new_pairs: update.new_pairs,
            spot_prices,
            tvl_updates,
        }
    }
}

pub async fn ws_handler(
    State(state): State<SimulationState>,
    ws: WebSocketUpgrade,
) -> impl IntoResponse {
    ws.on_upgrade(|websocket| handle_socket(websocket, state))
}

async fn handle_socket(websocket: axum::extract::ws::WebSocket, state: SimulationState) {
    info!("New WebSocket connection established");

    // Split the socket into sender and receiver
    let (mut sender, mut receiver) = websocket.split();

    // Subscribe to simulation updates
    let mut update_rx = state.subscribe_to_updates();

    // Send current state immediately when a client connects
    let latest_block = state.get_full_state().await;
    let client_update = ClientUpdate::from(latest_block);
    if let Ok(msg) = serde_json::to_string(&client_update) {
        if let Err(e) = sender.send(axum::extract::ws::Message::Text(msg)).await {
            error!("Error sending initial state: {}", e);
            return;
        }
    }

    // Spawn a task to handle sending updates to the client
    let send_task = tokio::spawn(async move {
        loop {
            // Receive the next update from the broadcast channel
            let update = match update_rx.recv().await {
                Ok(update) => update,
                Err(broadcast::error::RecvError::Closed) => {
                    info!("Update channel closed");
                    break;
                }
                Err(broadcast::error::RecvError::Lagged(skipped)) => {
                    error!("Client lagging behind, skipped {} messages", skipped);
                    continue;
                }
            };

            // Convert to client update format
            let client_update = ClientUpdate::from(update);

            // Serialize the update to send to the client
            let msg = match serde_json::to_string(&client_update) {
                Ok(msg) => msg,
                Err(e) => {
                    error!("Error serializing update: {}", e);
                    continue;
                }
            };

            // Send the update to the client
            if let Err(e) = sender.send(axum::extract::ws::Message::Text(msg)).await {
                error!("Error sending message: {}", e);
                break;
            }
        }
    });

    // Handle messages from the client
    let receive_task = tokio::spawn(async move {
        while let Some(result) = receiver.next().await {
            match result {
                Ok(axum::extract::ws::Message::Text(text)) => {
                    info!("Received message: {}", text);

                    // Here you could handle client requests
                    // For example, client could request historical data
                }
                Ok(axum::extract::ws::Message::Close(_)) => {
                    info!("Client initiated close");
                    break;
                }
                _ => {}
            }
        }
    });

    // Wait for either task to finish
    tokio::select! {
        _ = send_task => info!("Send task completed"),
        _ = receive_task => info!("Receive task completed"),
    }

    info!("WebSocket connection closed");
}
