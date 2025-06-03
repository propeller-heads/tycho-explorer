import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useReducer, useRef } from 'react';
import { Pool, WebSocketPool } from '../types';
import { CHAIN_CONFIG } from '@/config/chains';

interface WebSocketMessage {
  new_pairs?: Record<string, WebSocketPool>;
  spot_prices?: Record<string, number>;
  block_number?: number;
}

interface PoolDataContextValue {
  pools: Record<string, Pool>;
  poolsArray: Pool[]; // Add memoized array to avoid Object.values() in consuming components
  isConnected: boolean;
  isUsingMockData: boolean;
  highlightedPoolId: string | null;
  connectToWebSocket: (chain: string) => void;
  disconnectWebSocket: () => void;
  highlightPool: (poolId: string | null) => void;
  blockNumber: number;
  selectedChain: string;
  availableChains: string[];
  lastBlockTimestamp: number | null; // Added
  estimatedBlockDuration: number; // Added
}

// Define actions for our reducer
type PoolDataAction = 
  | { type: 'SET_POOLS', payload: Record<string, Pool> }
  | { type: 'UPDATE_POOLS', payload: Record<string, Pool> }
  | { type: 'SET_HIGHLIGHTED_POOL', payload: string | null }
  | { type: 'SET_CONNECTION_STATE', payload: { isConnected: boolean } }
  | { type: 'SET_BLOCK_NUMBER', payload: { blockNumber: number; timestamp: number } } // Updated
  | { type: 'SET_SELECTED_CHAIN', payload: string }
  | { type: 'RESET_STATE' };

// Define the state interface
interface PoolDataState {
  pools: Record<string, Pool>;
  isConnected: boolean;
  highlightedPoolId: string | null;
  blockNumber: number;
  selectedChain: string;
  lastBlockTimestamp: number | null; // Added
  estimatedBlockDuration: number; // Added
  pendingUpdates: {
    pools: Record<string, Pool>;
  };
}

// Reducer function for better state management
const DEFAULT_ESTIMATED_BLOCK_DURATION = 12000; // Default for Ethereum ~12s

function poolDataReducer(state: PoolDataState, action: PoolDataAction): PoolDataState {
  switch (action.type) {
    case 'SET_POOLS':
      return {
        ...state,
        pools: action.payload,
        pendingUpdates: {
          ...state.pendingUpdates,
          pools: {}
        }
      };
    case 'UPDATE_POOLS':
      return {
        ...state,
        pendingUpdates: {
          ...state.pendingUpdates,
          pools: {
            ...state.pendingUpdates.pools,
            ...action.payload
          }
        }
      };
    case 'SET_HIGHLIGHTED_POOL':
      return {
        ...state,
        highlightedPoolId: action.payload
      };
    case 'SET_CONNECTION_STATE':
      return {
        ...state,
        isConnected: action.payload.isConnected
      };
    case 'SET_BLOCK_NUMBER': {
      const newTimestamp = action.payload.timestamp;
      let newEstimatedDuration = state.estimatedBlockDuration;
      if (state.lastBlockTimestamp) {
        const duration = newTimestamp - state.lastBlockTimestamp;
        // Basic sanity check for duration, e.g., between 1s and 60s
        if (duration > 1000 && duration < 60000) {
          newEstimatedDuration = duration;
        }
      }
      return {
        ...state,
        blockNumber: action.payload.blockNumber,
        lastBlockTimestamp: newTimestamp,
        estimatedBlockDuration: newEstimatedDuration,
      };
    }
    case 'SET_SELECTED_CHAIN':
      return {
        ...state,
        selectedChain: action.payload
      };
    case 'RESET_STATE':
      return {
        ...state,
        pools: {},
        isConnected: false,
        pendingUpdates: {
          pools: {}
        }
      };
    default:
      return state;
  }
}

const PoolDataContext = createContext<PoolDataContextValue | undefined>(undefined);

// Helper function to convert WebSocketPool to Pool
const convertWebSocketPool = (
  pool: WebSocketPool, 
  spotPrices: Record<string, number>
): Pool => {
  // Create a modified copy of the pool with potentially updated token symbols
  const modifiedPool = {
    ...pool,
    tokens: pool.tokens.map(token => {
      // If token symbol is all zeros (like "0x0000..."), replace it with "ETH"
      if (token.symbol && /^0x0+$/.test(token.symbol)) {
        return { ...token, symbol: "ETH" };
      }
      return token;
    })
  };

  return {
    ...modifiedPool,
    spotPrice: spotPrices[pool.id] || 0, // Use spot price from map if available
    updatedAt: new Date().toISOString(),
    lastUpdatedAtBlock: 0, // Initialize with 0, will be updated when pool receives updates
  } as unknown as Pool;
};

// Available chains
const AVAILABLE_CHAINS = ['Ethereum', 'Base', 'Unichain'];

// Default chain
const DEFAULT_CHAIN = 'Ethereum';

// No reconnection logic

export function PoolDataProvider({ children }: { children: React.ReactNode }) {
  // Check URL for initial chain
  const getInitialChain = () => {
    const params = new URLSearchParams(window.location.search);
    const chainFromUrl = params.get('chain');
    if (chainFromUrl && AVAILABLE_CHAINS.includes(chainFromUrl)) {
      return chainFromUrl;
    }
    return DEFAULT_CHAIN;
  };

  // Initialize state and variables
  const [state, dispatch] = useReducer(poolDataReducer, {
    pools: {},
    isConnected: false,
    highlightedPoolId: null,
    blockNumber: 0,
    selectedChain: getInitialChain(),
    lastBlockTimestamp: null, // Initialize
    estimatedBlockDuration: DEFAULT_ESTIMATED_BLOCK_DURATION, // Initialize
    pendingUpdates: {
      pools: {}
    }
  });
  
  // Create a ref to always access the latest state
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  const socketRef = useRef<WebSocket | null>(null); // Add ref to track current socket
  const [updateScheduled, setUpdateScheduled] = useState(false);
  const [autoConnected, setAutoConnected] = useState(false);
  
  // Reconnection has been removed
  
  // Define disconnectWebSocket first to avoid the reference error
  const disconnectWebSocket = useCallback(() => {
    // Use ref instead of state to ensure we always close the current socket
    if (socketRef.current) {
      console.log('🔴 Closing WebSocket connection');
      
      // Remove all event handlers before closing to prevent any lingering messages
      socketRef.current.onopen = null;
      socketRef.current.onmessage = null;
      socketRef.current.onerror = null;
      socketRef.current.onclose = null;
      
      // Close the connection
      socketRef.current.close();
      socketRef.current = null;
      dispatch({ 
        type: 'SET_CONNECTION_STATE', 
        payload: { isConnected: false } 
      });
      
      // Reset state when disconnected
      dispatch({ type: 'RESET_STATE' });
      
      // Reset auto-connection state to allow manual reconnection
      setAutoConnected(false);
    }
  }, []); // Remove socket from dependencies since we use ref
  
  
  // Removed auto-reconnection function
  
  // Update the connection function to reset reconnection state
  const connectToWebSocket = useCallback((chain: string) => {
    // Update the selected chain
    dispatch({ type: 'SET_SELECTED_CHAIN', payload: chain });
    
    // Get URL from chain config
    const chainConfig = CHAIN_CONFIG[chain as keyof typeof CHAIN_CONFIG];
    if (!chainConfig || !chainConfig.wsUrl) {
      console.error('No WebSocket URL configured for chain:', chain);
      return;
    }
    
    const url = chainConfig.wsUrl;
    
    // Clear pool data when switching chains
    console.log('🟣 [CHAIN] Clearing pool data for chain switch to:', chain);
    dispatch({ type: 'RESET_STATE' });
    
    // Close existing connection if any
    disconnectWebSocket();

    try {
      // Create new WebSocket connection
      const ws = new WebSocket(url);
      socketRef.current = ws;
      setAutoConnected(true); // Mark as auto-connected

      ws.onopen = () => {        
        // Set connection state but don't clear existing pool data
        dispatch({ 
          type: 'SET_CONNECTION_STATE', 
          payload: { isConnected: true } 
        });
        
        console.log('✅ WebSocket connected. Waiting for block updates with price changes...');
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);

          console.log('Websocket: data:', data);
          
          // Debug log to see message structure
          console.log('🔳 WebSocket message:', {
            hasBlockNumber: !!data.block_number,
            hasNewPairs: !!data.new_pairs,
            hasSpotPrices: !!data.spot_prices,
            spotPriceCount: data.spot_prices ? Object.keys(data.spot_prices).length : 0,
            newPairCount: data.new_pairs ? Object.keys(data.new_pairs).length : 0
          });

          // Collect spot prices first
          const spotPrices = data.spot_prices || {};
          
          // Update block number if provided
          if (data.block_number) {
            console.log('🔷 WebSocket: New block number received:', data.block_number);
            dispatch({ 
              type: 'SET_BLOCK_NUMBER', 
              payload: { blockNumber: data.block_number, timestamp: Date.now() } 
            });
            
            // Log when no price updates come with block update
            if (Object.keys(spotPrices).length === 0 && Object.keys(stateRef.current.pools).length > 0) {
              console.log('⚠️ No price updates from server with block update');
            }
          }

          // Debug log spot prices
          if (Object.keys(spotPrices).length > 0) {
            console.log(`🔵 WebSocket: Spot prices received for ${Object.keys(spotPrices).length} pools`);
          }
          
          // Process new pools and incorporate spot prices
          const poolUpdates: Record<string, Pool> = {};
          
          // Add new pairs
          if (data.new_pairs) {
            const blockForNewPairs = data.block_number || stateRef.current.blockNumber || 0;
            Object.entries(data.new_pairs).forEach(([id, wsPool]) => {
              const pool = convertWebSocketPool(wsPool, spotPrices);
              poolUpdates[id] = {
                ...pool,
                lastUpdatedAtBlock: blockForNewPairs // Set the block number when the pool is first seen
              };
              
              // Log new pairs
              if (blockForNewPairs > 0) {
                console.log(`🆕 New pool ${id} at block ${blockForNewPairs}`);
              }
            });
          }
          
          // Update existing pools with new spot prices
          if (spotPrices && Object.keys(spotPrices).length > 0) {
            // Only update lastUpdatedAtBlock if we have a valid block number
            const updateBlock = data.block_number || 0;
            
            Object.entries(spotPrices).forEach(([id, price]) => {
              if (!poolUpdates[id] && stateRef.current.pools[id]) {
                const existingPool = stateRef.current.pools[id];
                const shouldUpdateBlock = updateBlock > 0 && updateBlock !== existingPool.lastUpdatedAtBlock;
                
                poolUpdates[id] = {
                  ...existingPool,
                  spotPrice: price,
                  updatedAt: new Date().toISOString(),
                  // Only update lastUpdatedAtBlock if we have a valid block number
                  lastUpdatedAtBlock: shouldUpdateBlock ? updateBlock : existingPool.lastUpdatedAtBlock
                };
                
                // Debug log for edge widening
                if (shouldUpdateBlock) {
                  console.log(`🔶 Pool ${id} price updated at block ${updateBlock}:`, {
                    poolId: id,
                    oldBlock: existingPool.lastUpdatedAtBlock,
                    newBlock: updateBlock,
                    currentStateBlock: stateRef.current.blockNumber,
                    spotPrice: price
                  });
                }
              }
            });
          }
          
          // Only dispatch if we have updates
          if (Object.keys(poolUpdates).length > 0) {
            dispatch({ type: 'UPDATE_POOLS', payload: poolUpdates });
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        dispatch({ 
          type: 'SET_CONNECTION_STATE', 
          payload: { isConnected: false } 
        });
        
        // Reset state on error
        dispatch({ type: 'RESET_STATE' });
        
        // Reset auto-connection state
        setAutoConnected(false);
        
        // Clear socket ref on error
        socketRef.current = null;
      };

      ws.onclose = () => {
        dispatch({ 
          type: 'SET_CONNECTION_STATE', 
          payload: { isConnected: false } 
        });
        
        // Reset state on close
        dispatch({ type: 'RESET_STATE' });
        
        // Reset auto-connection state
        setAutoConnected(false);
        
        socketRef.current = null; // Clear ref
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      dispatch({ 
        type: 'SET_CONNECTION_STATE', 
        payload: { isConnected: false } 
      });
      
      // Reset state on connection error
      dispatch({ type: 'RESET_STATE' });
      
      // Reset auto-connection state
      setAutoConnected(false);
    }
  }, [disconnectWebSocket]);
  
  // Apply pending updates to the state at a controlled frequency
  useEffect(() => {
    const hasPoolUpdates = Object.keys(stateRef.current.pendingUpdates.pools).length > 0;

    if (hasPoolUpdates) {
      console.log("🔸 Pending pool updates:", {
        count: Object.keys(stateRef.current.pendingUpdates.pools).length,
        currentBlock: stateRef.current.blockNumber,
        updates: Object.entries(stateRef.current.pendingUpdates.pools).map(([id, pool]) => ({
          id,
          lastUpdatedAtBlock: pool.lastUpdatedAtBlock
        }))
      });
    }
    
    if (hasPoolUpdates && !updateScheduled) {
      setUpdateScheduled(true);

      // Use requestAnimationFrame to batch updates
      requestAnimationFrame(() => {
        if (hasPoolUpdates) {
          const updatedPools = {
            ...stateRef.current.pools,
            ...stateRef.current.pendingUpdates.pools
          };
          dispatch({
            type: 'SET_POOLS',
            payload: updatedPools
          });
          console.log('🔹 Pool updates applied to state');
        }
        
        setUpdateScheduled(false);
      });
    }
  }, [state.pendingUpdates, state.pools, updateScheduled]);

  // Auto-connect to WebSocket on page load
  useEffect(() => {
    // Only connect once to avoid infinite connection attempts
    if (!autoConnected && !state.isConnected) {
      console.log('Auto-connecting to WebSocket for chain:', state.selectedChain);
      connectToWebSocket(state.selectedChain);
      setAutoConnected(true);
    }
  }, [autoConnected, state.isConnected, state.selectedChain, connectToWebSocket]);

  const highlightPool = useCallback((poolId: string | null) => {
    dispatch({ type: 'SET_HIGHLIGHTED_POOL', payload: poolId });
  }, []);

  // Object.values is expensive for large objects - memoize pools array 
  const poolsArray = useMemo(() => Object.values(state.pools), [state.pools]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => {
    console.log("Creating new PoolDataContext value", new Date().toISOString());
    return {
      pools: state.pools,
      poolsArray,
      isConnected: state.isConnected,
      isUsingMockData: false,
      highlightedPoolId: state.highlightedPoolId,
      blockNumber: state.blockNumber,
      selectedChain: state.selectedChain,
      lastBlockTimestamp: state.lastBlockTimestamp, // Added
      estimatedBlockDuration: state.estimatedBlockDuration, // Added
      connectToWebSocket,
      disconnectWebSocket,
      highlightPool,
      availableChains: AVAILABLE_CHAINS
    };
  }, [
    state.pools,
    poolsArray,
    state.isConnected, 
    state.highlightedPoolId,
    state.blockNumber,
    state.selectedChain,
    state.lastBlockTimestamp, // Added
    state.estimatedBlockDuration, // Added
    connectToWebSocket,
    disconnectWebSocket,
    highlightPool,
  ]);

  return (
    <PoolDataContext.Provider value={value}>
      {children}
    </PoolDataContext.Provider>
  );
}

export function usePoolData() {
  const context = useContext(PoolDataContext);
  if (context === undefined) {
    throw new Error('usePoolData must be used within a PoolDataProvider');
  }
  return context;
}
