/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useReducer, useRef } from 'react';
import { Pool, WebSocketPool } from '@/components/dexscan/app/types';
import { CHAIN_CONFIG } from '@/components/dexscan/shared/chains';

// Export DATA_STATES enum
export const DATA_STATES = {
  DISCONNECTED: 'disconnected' as const,
  CONNECTING: 'connecting' as const,
  WAITING: 'waiting' as const,
  READY: 'ready' as const
};

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
  connectionState: 'disconnected' | 'connecting' | 'connected';
  connectionStartTime: number | null;
  dataState: 'disconnected' | 'connecting' | 'waiting' | 'ready';
  availableProtocols: string[];
  availableTokens: Array<{
    address: string;
    symbol: string;
  }>;
}

// Define actions for our reducer
type PoolDataAction = 
  | { type: 'SET_POOLS', payload: Record<string, Pool> }
  | { type: 'UPDATE_POOLS', payload: Record<string, Pool> }
  | { type: 'SET_HIGHLIGHTED_POOL', payload: string | null }
  | { type: 'SET_CONNECTION_STATE', payload: { isConnected: boolean } }
  | { type: 'SET_BLOCK_NUMBER', payload: { blockNumber: number; timestamp: number } } // Updated
  | { type: 'SET_SELECTED_CHAIN', payload: string }
  | { type: 'RESET_STATE' }
  | { type: 'SET_CONNECTION_STATUS', payload: { connectionState: 'disconnected' | 'connecting' | 'connected'; connectionStartTime?: number } };

// Define the state interface
interface PoolDataState {
  pools: Record<string, Pool>;
  isConnected: boolean;
  highlightedPoolId: string | null;
  blockNumber: number;
  selectedChain: string;
  lastBlockTimestamp: number | null; // Added
  estimatedBlockDuration: number; // Added
  connectionState: 'disconnected' | 'connecting' | 'connected';
  connectionStartTime: number | null;
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
    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        connectionState: action.payload.connectionState,
        connectionStartTime: action.payload.connectionStartTime !== undefined 
          ? action.payload.connectionStartTime 
          : state.connectionStartTime
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
        connectionState: 'disconnected',
        connectionStartTime: null,
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

export const PoolDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    connectionState: 'disconnected',
    connectionStartTime: null,
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
      dispatch({
        type: 'SET_CONNECTION_STATUS',
        payload: { connectionState: 'disconnected', connectionStartTime: null }
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
      return;
    }
    
    const url = chainConfig.wsUrl;
    
    // Clear pool data when switching chains
    dispatch({ type: 'RESET_STATE' });
    
    // Close existing connection if any
    disconnectWebSocket();

    try {
      // Set connecting state with timestamp
      dispatch({
        type: 'SET_CONNECTION_STATUS',
        payload: { connectionState: 'connecting', connectionStartTime: Date.now() }
      });
      
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
        dispatch({
          type: 'SET_CONNECTION_STATUS',
          payload: { connectionState: 'connected' }
        });
        
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);

          

          // Collect spot prices first
          const spotPrices = data.spot_prices || {};
          
          // Update block number if provided
          if (data.block_number) {
            dispatch({ 
              type: 'SET_BLOCK_NUMBER', 
              payload: { blockNumber: data.block_number, timestamp: Date.now() } 
            });
            
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
        dispatch({
          type: 'SET_CONNECTION_STATUS',
          payload: { connectionState: 'disconnected', connectionStartTime: null }
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
        dispatch({
          type: 'SET_CONNECTION_STATUS',
          payload: { connectionState: 'disconnected', connectionStartTime: null }
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
      dispatch({
        type: 'SET_CONNECTION_STATUS',
        payload: { connectionState: 'disconnected', connectionStartTime: null }
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
      connectToWebSocket(state.selectedChain);
      setAutoConnected(true);
    }
  }, [autoConnected, state.isConnected, state.selectedChain, connectToWebSocket]);

  const highlightPool = useCallback((poolId: string | null) => {
    dispatch({ type: 'SET_HIGHLIGHTED_POOL', payload: poolId });
  }, []);

  // Object.values is expensive for large objects - memoize pools array 
  const poolsArray = useMemo(() => Object.values(state.pools), [state.pools]);
  
  // Derive available protocols from pools
  const availableProtocols = useMemo(() => {
    const protocols = new Set<string>();
    poolsArray.forEach(pool => {
      if (pool.protocol_system) {
        protocols.add(pool.protocol_system);
      }
    });
    return Array.from(protocols).sort();
  }, [poolsArray]);
  
  // Derive available tokens from pools
  const availableTokens = useMemo(() => {
    const tokenMap = new Map();
    poolsArray.forEach(pool => {
      pool.tokens.forEach(token => {
        if (!tokenMap.has(token.address)) {
          tokenMap.set(token.address, {
            address: token.address,
            symbol: token.symbol
          });
        }
      });
    });
    return Array.from(tokenMap.values());
  }, [poolsArray]);
  
  // Derive data state from connection state and data availability
  const dataState = useMemo((): 'disconnected' | 'connecting' | 'waiting' | 'ready' => {
    if (!state.isConnected) {
      return DATA_STATES.DISCONNECTED;
    }
    if (state.connectionState === 'connecting') {
      return DATA_STATES.CONNECTING;
    }
    if (poolsArray.length === 0) {
      return DATA_STATES.WAITING;
    }
    return DATA_STATES.READY;
  }, [state.isConnected, state.connectionState, poolsArray.length]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => {
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
      connectionState: state.connectionState,
      connectionStartTime: state.connectionStartTime,
      dataState,
      availableProtocols,
      availableTokens,
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
    state.connectionState,
    state.connectionStartTime,
    dataState,
    availableProtocols,
    availableTokens,
    connectToWebSocket,
    disconnectWebSocket,
    highlightPool,
  ]);

  return (
    <PoolDataContext.Provider value={value}>
      {children}
    </PoolDataContext.Provider>
  );
};

export function usePoolData() {
  const context = useContext(PoolDataContext);
  if (context === undefined) {
    throw new Error('usePoolData must be used within a PoolDataProvider');
  }
  return context;
}
