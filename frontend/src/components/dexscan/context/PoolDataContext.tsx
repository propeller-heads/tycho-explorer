import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useReducer, useRef } from 'react';
import { Pool, WebSocketPool } from '../types';
import { mockPools } from '@/data/mockPools';

interface WebSocketMessage {
  new_pairs?: Record<string, WebSocketPool>;
  spot_prices?: Record<string, number>;
  block_number?: number;
}

interface PoolDataContextValue {
  pools: Record<string, Pool>;
  isConnected: boolean;
  isUsingMockData: boolean;
  highlightedPoolId: string | null;
  websocketUrl: string;
  connectToWebSocket: (url: string, chain?: string) => void;
  disconnectWebSocket: () => void;
  highlightPool: (poolId: string | null) => void;
  isReconnecting: boolean;
  reconnectAttempt: number;
  maxReconnectAttempts: number;
  blockNumber: number;
  selectedChain: string;
  setSelectedChain: (chain: string) => void;
  availableChains: string[];
}

// Define actions for our reducer
type PoolDataAction = 
  | { type: 'SET_POOLS', payload: Record<string, Pool> }
  | { type: 'UPDATE_POOLS', payload: Record<string, Pool> }
  | { type: 'SET_HIGHLIGHTED_POOL', payload: string | null }
  | { type: 'SET_CONNECTION_STATE', payload: { isConnected: boolean, isUsingMockData: boolean } }
  | { type: 'SET_WEBSOCKET_URL', payload: string }
  | { type: 'SET_BLOCK_NUMBER', payload: number }
  | { type: 'SET_SELECTED_CHAIN', payload: string }
  | { type: 'RESET_TO_MOCK_DATA', payload: { pools: Record<string, Pool> } };

// Define the state interface
interface PoolDataState {
  pools: Record<string, Pool>;
  isConnected: boolean;
  isUsingMockData: boolean;
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
        isConnected: action.payload.isConnected,
        isUsingMockData: action.payload.isUsingMockData
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
    case 'RESET_TO_MOCK_DATA':
      return {
        ...state,
        pools: action.payload.pools,
        isConnected: false,
        isUsingMockData: true,
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
  return {
    ...pool,
    spotPrice: spotPrices[pool.id] || 0 // Use spot price from map if available
  } as unknown as Pool;
};

// Available chains
const AVAILABLE_CHAINS = ['Ethereum', 'Base', 'Unichain'];

// Default chain
const DEFAULT_CHAIN = 'Ethereum';

// Add a constant for reconnection attempts
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 2000; // 2 seconds

export function PoolDataProvider({ children }: { children: React.ReactNode }) {
  // Initialize state and variables
  const savedWebSocketUrl = localStorage.getItem('websocket_url') || 'ws://localhost:3000/ws';
  const savedChain = localStorage.getItem('selected_chain') || DEFAULT_CHAIN;
  
  const [state, dispatch] = useReducer(poolDataReducer, {
    pools: {},
    isConnected: false,
    isUsingMockData: true,
    highlightedPoolId: null,
    websocketUrl: savedWebSocketUrl,
    blockNumber: 0,
    selectedChain: savedChain,
    pendingUpdates: {
      pools: {}
    }
  });
  
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [updateScheduled, setUpdateScheduled] = useState(false);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Add state for reconnection UI indicators
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  
  // Define disconnectWebSocket first to avoid the reference error
  const disconnectWebSocket = useCallback(() => {
    if (socket) {
      socket.close();
      setSocket(null);
      dispatch({ 
        type: 'SET_CONNECTION_STATE', 
        payload: { isConnected: false, isUsingMockData: true } 
      });
      
      // When disconnected, load mock data
      loadMockData();
    }
  }, [socket]);
  
  const loadMockData = useCallback(() => {
    const mockData: Record<string, Pool> = {};
    
    // Create spot prices map for mock data
    const mockSpotPrices: Record<string, number> = {};
    mockPools.forEach(pool => {
      mockSpotPrices[pool.id] = parseFloat(pool.spot_price || '0');
    });

    // Convert pools with spot prices
    mockPools.forEach(pool => {
      mockData[pool.id] = convertWebSocketPool(
        pool as unknown as WebSocketPool, 
        mockSpotPrices
      );
    });

    console.log('Loading mock data with', Object.keys(mockData).length, 'pools');
    
    dispatch({ 
      type: 'RESET_TO_MOCK_DATA', 
      payload: { pools: mockData } 
    });
  }, []);
  
  // Update the reconnection function to update UI state
  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      console.log('Max reconnection attempts reached. Using mock data.');
      setIsReconnecting(false);
      setReconnectAttempt(0);
      dispatch({ 
        type: 'SET_CONNECTION_STATE', 
        payload: { isConnected: false, isUsingMockData: true } 
      });
      
      // Load mock data when max reconnection attempts reached
      loadMockData();
      return;
    }

    if (state.websocketUrl) {
      const currentAttempt = reconnectAttemptsRef.current + 1;
      console.log(`Attempting to reconnect (${currentAttempt}/${MAX_RECONNECT_ATTEMPTS})...`);
      setIsReconnecting(true);
      setReconnectAttempt(currentAttempt);
      connectToWebSocket(state.websocketUrl);
      reconnectAttemptsRef.current = currentAttempt;
    }
  }, [state.websocketUrl, loadMockData]);
  
  // Update the connection function to reset reconnection state
  const connectToWebSocket = useCallback((url: string, chain?: string) => {
    // If chain is provided, update the selected chain
    if (chain) {
      localStorage.setItem('selected_chain', chain);
      dispatch({ type: 'SET_SELECTED_CHAIN', payload: chain });
    }
    
    // Clear any pending reconnect attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Reset reconnect attempts when manually connecting
    if (reconnectAttemptsRef.current > 0) {
      reconnectAttemptsRef.current = 0;
      setReconnectAttempt(0);
    }
    
    // Close existing connection if any
    disconnectWebSocket();

    try {
      // Save URL to localStorage for persistence across refreshes
      localStorage.setItem('websocket_url', url);
      
      // Create new WebSocket connection
      const ws = new WebSocket(url);
      setSocket(ws);
      dispatch({ type: 'SET_WEBSOCKET_URL', payload: url });

      ws.onopen = () => {
        console.log('WebSocket connected to:', url);
        setIsReconnecting(false);
        setReconnectAttempt(0);
        
        // Clear all mock data when websocket is connected
        dispatch({ 
          type: 'SET_CONNECTION_STATE', 
          payload: { isConnected: true, isUsingMockData: false } 
        });
        
        // Clear out mock data by setting empty data objects
        dispatch({
          type: 'SET_POOLS',
          payload: {}
        });
        
        // Reset reconnection attempts on successful connection
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          
          console.log('WebSocket message received:', data);

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
              // Skip pools we've already processed from new_pairs
              if (!poolUpdates[id] && state.pools[id]) {
                poolUpdates[id] = {
                  ...state.pools[id],
                  spotPrice: price
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
          payload: { isConnected: false, isUsingMockData: true } 
        });
        
        // Load mock data on error
        loadMockData();
        
        // Schedule reconnection attempt on error
        reconnectTimeoutRef.current = setTimeout(attemptReconnect, RECONNECT_INTERVAL);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        dispatch({ 
          type: 'SET_CONNECTION_STATE', 
          payload: { isConnected: false, isUsingMockData: true } 
        });
        
        // Load mock data on close
        loadMockData();
        
        setSocket(null);
        // Schedule reconnection attempt on close
        reconnectTimeoutRef.current = setTimeout(attemptReconnect, RECONNECT_INTERVAL);
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      dispatch({ 
        type: 'SET_CONNECTION_STATE', 
        payload: { isConnected: false, isUsingMockData: true } 
      });
      
      // Load mock data on connection error
      loadMockData();
      
      // Schedule reconnection attempt on connection error
      reconnectTimeoutRef.current = setTimeout(attemptReconnect, RECONNECT_INTERVAL);
    }
  }, [disconnectWebSocket, attemptReconnect, loadMockData]);
  
  // Apply pending updates to the state at a controlled frequency
  useEffect(() => {
    const hasPoolUpdates = Object.keys(state.pendingUpdates.pools).length > 0;
    
    if (hasPoolUpdates && !updateScheduled) {
      setUpdateScheduled(true);
      console.log('Scheduling update with pending pools:', Object.keys(state.pendingUpdates.pools).length);
      
      // Use requestAnimationFrame to batch updates
      requestAnimationFrame(() => {
        if (hasPoolUpdates) {
          const updatedPools = {
            ...state.pools,
            ...state.pendingUpdates.pools
          };
          console.log('Applying pool updates, new pool count:', Object.keys(updatedPools).length);
          dispatch({
            type: 'SET_POOLS',
            payload: updatedPools
          });
        }
        
        setUpdateScheduled(false);
      });
    }
  }, [state.pendingUpdates, state.pools, updateScheduled]);

  // Load mock data on initial load or when switching to mock data mode
  useEffect(() => {
    // Only load mock data if we're using mock data and pools are empty or disconnected
    if (state.isUsingMockData && (Object.keys(state.pools).length === 0 || !state.isConnected)) {
      loadMockData();
      
      if (state.blockNumber === 0) {
        // Start with a realistic block number
        dispatch({ type: 'SET_BLOCK_NUMBER', payload: 17500000 });
      }
    }
  }, [state.isUsingMockData, state.pools, loadMockData, state.blockNumber, state.isConnected]);

  // Add an effect to simulate block updates when using mock data
  useEffect(() => {
    let mockBlockTimer: NodeJS.Timeout | null = null;
    
    if (state.isUsingMockData && state.blockNumber > 0) {
      // Increment block number every 5 seconds
      mockBlockTimer = setInterval(() => {
        dispatch({ type: 'SET_BLOCK_NUMBER', payload: state.blockNumber + 1 });
        
        // Include chain info in mock data processing
        console.log(`Mock block update for chain: ${state.selectedChain}`);
      }, 5000);
    }
    
    return () => {
      if (mockBlockTimer) {
        clearInterval(mockBlockTimer);
      }
    };
  }, [state.isUsingMockData, state.blockNumber, state.selectedChain]);

  // Add an effect to attempt connection on initial load
  useEffect(() => {
    if (state.websocketUrl && !socket && !reconnectTimeoutRef.current) {
      connectToWebSocket(state.websocketUrl);
    }
    
    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      disconnectWebSocket();
    };
  }, []);

  const highlightPool = useCallback((poolId: string | null) => {
    dispatch({ type: 'SET_HIGHLIGHTED_POOL', payload: poolId });
  }, []);

  // Function to set the selected chain
  const setSelectedChain = useCallback((chain: string) => {
    localStorage.setItem('selected_chain', chain);
    dispatch({ type: 'SET_SELECTED_CHAIN', payload: chain });
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    pools: state.pools,
    isConnected: state.isConnected,
    isUsingMockData: state.isUsingMockData,
    highlightedPoolId: state.highlightedPoolId,
    websocketUrl: state.websocketUrl,
    blockNumber: state.blockNumber,
    selectedChain: state.selectedChain,
    connectToWebSocket,
    disconnectWebSocket,
    highlightPool,
    isReconnecting,
    reconnectAttempt,
    maxReconnectAttempts: MAX_RECONNECT_ATTEMPTS,
    setSelectedChain,
    availableChains: AVAILABLE_CHAINS
  }), [
    state.pools, 
    state.isConnected, 
    state.isUsingMockData,
    state.highlightedPoolId,
    state.websocketUrl,
    state.blockNumber,
    state.selectedChain,
    connectToWebSocket,
    disconnectWebSocket,
    highlightPool,
    isReconnecting,
    reconnectAttempt,
    setSelectedChain
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