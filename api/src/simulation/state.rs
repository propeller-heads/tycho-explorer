use std::{collections::HashMap, sync::Arc};
use tokio::sync::{RwLock, broadcast};
use tycho_simulation::{
    models::Token,
    protocol::{
        models::{BlockUpdate, ProtocolComponent},
        state::ProtocolSim,
    },
};

/// Represents the current state of the simulation
#[derive(Debug, Clone)]
pub struct SimulationState {
    states: Arc<RwLock<HashMap<String, Box<dyn ProtocolSim>>>>,
    components: Arc<RwLock<HashMap<String, ProtocolComponent>>>,
    tokens: Arc<RwLock<HashMap<String, Token>>>,
    current_block: u64,
    // A broadcast channel to notify listeners of new updates
    updates: broadcast::Sender<BlockUpdate>,
}

impl SimulationState {
    pub fn new() -> Self {
        // Create a channel with a maximum buffer size of 100 messages
        let (tx, _) = broadcast::channel(100);

        SimulationState {
            states: Arc::new(RwLock::new(HashMap::new())),
            components: Arc::new(RwLock::new(HashMap::new())),
            tokens: Arc::new(RwLock::new(HashMap::new())),
            current_block: 0,
            updates: tx,
        }
    }

    /// Update the state with a new block update
    pub async fn update(&self, update: BlockUpdate) {
        // Add the update to our storage
        {
            self.states.write().await.extend(update.states.clone());
            self.components
                .write()
                .await
                .extend(update.new_pairs.clone());
        }

        // Broadcast the update to all subscribers
        let _ = self.updates.send(update);
    }

    /// Method to get pool state for simulation
    pub async fn get_pool_state(&self, address: &str) -> Option<Box<dyn ProtocolSim>> {
        self.states.read().await.get(address).cloned()
    }

    pub async fn get_full_state(&self) -> BlockUpdate {
        return BlockUpdate {
            block_number: self.current_block,
            states: self.states.read().await.clone(),
            new_pairs: self.components.read().await.clone(),
            removed_pairs: HashMap::new(),
        };
    }

    /// Subscribe to receive all future block updates
    pub fn subscribe_to_updates(&self) -> broadcast::Receiver<BlockUpdate> {
        self.updates.subscribe()
    }
}

impl Default for SimulationState {
    fn default() -> Self {
        Self::new()
    }
}
