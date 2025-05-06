import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useReducer, useRef } from 'react';
import { Pool, WebSocketPool } from '../types';

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
  websocketUrl: string;
  connectToWebSocket: (url: string, chain?: string) => void;
  disconnectWebSocket: () => void;
  highlightPool: (poolId: string | null) => void;
  blockNumber: number;
  selectedChain: string;
  availableChains: string[];
}

// Define actions for our reducer
type PoolDataAction = 
  | { type: 'SET_POOLS', payload: Record<string, Pool> }
  | { type: 'UPDATE_POOLS', payload: Record<string, Pool> }
  | { type: 'SET_HIGHLIGHTED_POOL', payload: string | null }
  | { type: 'SET_CONNECTION_STATE', payload: { isConnected: boolean } }
  | { type: 'SET_WEBSOCKET_URL', payload: string }
  | { type: 'SET_BLOCK_NUMBER', payload: number }
  | { type: 'SET_SELECTED_CHAIN', payload: string }
  | { type: 'RESET_STATE' };

// Define the state interface
interface PoolDataState {
  pools: Record<string, Pool>;
  isConnected: boolean;
  highlightedPoolId: string | null;
  websocketUrl: string;
  blockNumber: number;
  selectedChain: string;
  pendingUpdates: {
    pools: Record<string, Pool>;
  };
}

// Reducer function for better state management
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
    case 'SET_WEBSOCKET_URL':
      return {
        ...state,
        websocketUrl: action.payload
      };
    case 'SET_BLOCK_NUMBER':
      return {
        ...state,
        blockNumber: action.payload
      };
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
    updatedAt: new Date().toISOString().slice(0, 19)
  } as unknown as Pool;
};

// Available chains
const AVAILABLE_CHAINS = ['Ethereum', 'Base', 'Unichain'];

// Default chain
const DEFAULT_CHAIN = 'Ethereum';

// No reconnection logic

export function PoolDataProvider({ children }: { children: React.ReactNode }) {
  // Initialize state and variables
  const savedWebSocketUrl = localStorage.getItem('websocket_url') || 'ws://localhost:3000/ws';
  const savedChain = localStorage.getItem('selected_chain') || DEFAULT_CHAIN;
  
  const [state, dispatch] = useReducer(poolDataReducer, {
    pools: {},
    isConnected: false,
    highlightedPoolId: null,
    websocketUrl: savedWebSocketUrl,
    blockNumber: 0,
    selectedChain: savedChain,
    pendingUpdates: {
      pools: {}
    }
  });
  
  // Create a ref to always access the latest state
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [updateScheduled, setUpdateScheduled] = useState(false);
  const [autoConnected, setAutoConnected] = useState(false);
  
  // Reconnection has been removed
  
  // Define disconnectWebSocket first to avoid the reference error
  const disconnectWebSocket = useCallback(() => {
    if (socket) {
      socket.close();
      setSocket(null);
      dispatch({ 
        type: 'SET_CONNECTION_STATE', 
        payload: { isConnected: false } 
      });
      
      // Reset state when disconnected
      dispatch({ type: 'RESET_STATE' });
      
      // Reset auto-connection state to allow manual reconnection
      setAutoConnected(false);
    }
  }, [socket]);
  
  
  // Removed auto-reconnection function
  
  // Update the connection function to reset reconnection state
  const connectToWebSocket = useCallback((url: string, chain?: string) => {
    // If chain is provided, update the selected chain
    if (chain) {
      localStorage.setItem('selected_chain', chain);
      dispatch({ type: 'SET_SELECTED_CHAIN', payload: chain });
    }
    
    // Manual reconnection is handled directly
    
    // Close existing connection if any
    disconnectWebSocket();

    try {
      // Save URL to localStorage for persistence across refreshes
      localStorage.setItem('websocket_url', url);
      
      // Create new WebSocket connection
      const ws = new WebSocket(url);
      setSocket(ws);
      setAutoConnected(true); // Mark as auto-connected
      dispatch({ type: 'SET_WEBSOCKET_URL', payload: url });

      ws.onopen = () => {        
        // Set connection state but don't clear existing pool data
        dispatch({ 
          type: 'SET_CONNECTION_STATE', 
          payload: { isConnected: true } 
        });
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);

          // Update block number if provided
          if (data.block_number) {
            dispatch({ type: 'SET_BLOCK_NUMBER', payload: data.block_number });
          }

          // Collect spot prices
          const spotPrices = data.spot_prices || {};
          
          // Process new pools and incorporate spot prices
          const poolUpdates: Record<string, Pool> = {};
          
          // Add new pairs
          if (data.new_pairs) {
            Object.entries(data.new_pairs).forEach(([id, wsPool]) => {
              poolUpdates[id] = convertWebSocketPool(wsPool, spotPrices);
            });
          }
          
          // Update existing pools with new spot prices
          if (spotPrices && Object.keys(spotPrices).length > 0) {
            Object.entries(spotPrices).forEach(([id, price]) => {
              if (!poolUpdates[id] && stateRef.current.pools[id]) {
                poolUpdates[id] = {
                  ...stateRef.current.pools[id],
                  spotPrice: price,
                  updatedAt: new Date().toISOString().slice(0, 19)
                };
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
        
        setSocket(null);
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

    console.log("pool updates from ws: ", stateRef.current.pendingUpdates.pools);
    
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
        }
        
        setUpdateScheduled(false);
      });
    }
  }, [state.pendingUpdates, state.pools, updateScheduled]);

  // Auto-connect to WebSocket on page load
  useEffect(() => {
    // Only connect once to avoid infinite connection attempts
    if (!autoConnected && !state.isConnected) {
      console.log('Auto-connecting to WebSocket:', state.websocketUrl);
      connectToWebSocket(state.websocketUrl);
      setAutoConnected(true);
    }
  }, [autoConnected, connectToWebSocket, state.isConnected, state.websocketUrl]);

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
      websocketUrl: state.websocketUrl,
      blockNumber: state.blockNumber,
      selectedChain: state.selectedChain,
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
    state.websocketUrl,
    state.blockNumber,
    state.selectedChain,
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