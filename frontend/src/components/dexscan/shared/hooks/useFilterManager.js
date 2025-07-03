import { useCallback, useEffect, useReducer } from 'react';
import { usePoolData, DATA_STATES } from '@/components/dexscan/shared/PoolDataContext';

// State separator constant
const STATE_SEPARATOR = '__';

// Flattened state ENUMs using parent__child syntax
const FILTER_STATES = {
  INITIAL: 'INITIAL',
  FIRST_VISIT__WAITING: 'FIRST_VISIT__WAITING',           // Waiting for correct chain data
  FIRST_VISIT__MISMATCHED: 'FIRST_VISIT__MISMATCHED',     // Wrong chain data received
  READY__MATCHED: 'READY__MATCHED',                       // Normal ready state
  READY__MISMATCHED: 'READY__MISMATCHED',                 // Wrong chain, needs reset
};

// Action ENUMs
const FILTER_ACTIONS = {
  INIT: 'INIT',
  CHAIN_READY: 'CHAIN_READY',
  SET_TOKENS: 'SET_TOKENS',
  SET_PROTOCOLS: 'SET_PROTOCOLS',
  RESET: 'RESET'
};

// LocalStorage helpers
const STORAGE_KEY_PREFIX = 'dexscan_filters_';

function getStorageKey(chain) {
  return `${STORAGE_KEY_PREFIX}${chain}`;
}

function loadFromLocalStorage(chain) {
  try {
    const key = getStorageKey(chain);
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      return {
        selectedTokens: [],
        selectedProtocols: [],
        hasProtocolsEntry: false
      };
    }
    
    const parsed = JSON.parse(stored);
    return {
      selectedTokens: parsed.selectedTokens || [],
      selectedProtocols: parsed.selectedProtocols || [],
      hasProtocolsEntry: true
    };
  } catch (error) {
    console.error('Error loading filters from localStorage:', error);
    return {
      selectedTokens: [],
      selectedProtocols: [],
      hasProtocolsEntry: false
    };
  }
}

function saveToLocalStorage(chain, filters) {
  try {
    const key = getStorageKey(chain);
    localStorage.setItem(key, JSON.stringify(filters));
  } catch (error) {
    console.error('Error saving filters to localStorage:', error);
  }
}

function clearFromLocalStorage(chain) {
  try {
    const key = getStorageKey(chain);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing filters from localStorage:', error);
  }
}

// Helper functions for common reducer operations
function createResetState(state) {
  return {
    ...state,
    filterState: FILTER_STATES.INITIAL,
    selectedTokens: [],
    selectedProtocols: []
  };
}

function handleToggleItem(currentItems, item, isSelected) {
  return isSelected 
    ? [...currentItems, item]
    : currentItems.filter(i => i !== item);
}

function saveFiltersAndLog(state, preState, actionType) {
  saveToLocalStorage(state.chain, {
    selectedTokens: state.selectedTokens,
    selectedProtocols: state.selectedProtocols
  });
  console.log(`[FilterReducer] ${preState} -> ${state.filterState} (${actionType})`);
  return state;
}

// Helper to create state with updated available data
function updateAvailableData(state, availableProtocols, availableTokens) {
  return {
    ...state,
    availableProtocols,
    availableTokens
  };
}

// Helper to transition to a new filter state
function transitionToState(state, newFilterState) {
  return {
    ...state,
    filterState: newFilterState
  };
}

// Helper for first visit state creation
function createFirstVisitReadyState(state, action) {
  return {
    ...state,
    filterState: FILTER_STATES.READY__MATCHED,
    selectedProtocols: action.availableProtocols,
    availableProtocols: action.availableProtocols,
    availableTokens: action.availableTokens
  };
}

// Action handler functions
function handleInit(state, action) {
  const preState = state.filterState;
  
  switch (preState) {
    case FILTER_STATES.INITIAL: {
      const stored = loadFromLocalStorage(action.chain);
      
      if (!stored.hasProtocolsEntry) {
        return {
          ...state,
          filterState: FILTER_STATES.FIRST_VISIT__WAITING,
          chain: action.chain,
          selectedTokens: stored.selectedTokens,
          selectedProtocols: []
        };
      }
      
      return {
        ...state,
        filterState: FILTER_STATES.READY__MATCHED,
        chain: action.chain,
        selectedTokens: stored.selectedTokens,
        selectedProtocols: stored.selectedProtocols
      };
    }
    
    default:
      throw new Error(`Invalid state ${preState} for action INIT`);
  }
}

function handleChainReady(state, action) {
  const preState = state.filterState;
  const isCorrectChain = !action.chain || action.chain === state.chain;
  
  switch (preState) {
    case FILTER_STATES.FIRST_VISIT__WAITING: {
      if (!isCorrectChain) {
        return transitionToState(state, FILTER_STATES.FIRST_VISIT__MISMATCHED);
      }
      
      const newState = createFirstVisitReadyState(state, action);
      return saveFiltersAndLog(newState, preState, 'CHAIN_READY');
    }
    
    case FILTER_STATES.FIRST_VISIT__MISMATCHED: {
      if (isCorrectChain) {
        const newState = createFirstVisitReadyState(state, action);
        return saveFiltersAndLog(newState, preState, 'CHAIN_READY');
      }
      return state;
    }
    
    case FILTER_STATES.READY__MATCHED: {
      if (!isCorrectChain) {
        return transitionToState(state, FILTER_STATES.READY__MISMATCHED);
      }
      
      // Update available data without changing state
      return updateAvailableData(state, action.availableProtocols, action.availableTokens);
    }
    
    case FILTER_STATES.READY__MISMATCHED: {
      if (isCorrectChain) {
        // Update data and transition back to matched
        const newState = {
          ...updateAvailableData(state, action.availableProtocols, action.availableTokens),
          filterState: FILTER_STATES.READY__MATCHED
        };
        return newState;
      }
      return state;
    }
    
    default:
      throw new Error(`Invalid state ${preState} for action CHAIN_READY`);
  }
}

function handleSetTokens(state, action) {
  const preState = state.filterState;
  
  switch (preState) {
    case FILTER_STATES.READY__MATCHED: {
      let newTokens;
      if (action.token && action.isSelected !== undefined) {
        newTokens = handleToggleItem(state.selectedTokens, action.token, action.isSelected);
      } else {
        newTokens = action.tokens || [];
      }
      
      const tokensState = {
        ...state,
        selectedTokens: newTokens
      };
      
      return saveFiltersAndLog(tokensState, preState, action.type);
    }
    
    // Ignore token actions when not ready - prevents errors during initialization
    case FILTER_STATES.INITIAL:
    case FILTER_STATES.FIRST_VISIT__WAITING:
    case FILTER_STATES.FIRST_VISIT__MISMATCHED:
    case FILTER_STATES.READY__MISMATCHED:
      return state;
    
    default:
      throw new Error(`Invalid state ${preState} for action SET_TOKENS`);
  }
}

function handleSetProtocols(state, action) {
  const preState = state.filterState;
  
  switch (preState) {
    case FILTER_STATES.READY__MATCHED: {
      let newProtocols;
      if (action.protocol && action.isSelected !== undefined) {
        newProtocols = handleToggleItem(state.selectedProtocols, action.protocol, action.isSelected);
      } else {
        newProtocols = action.protocols || [];
      }
      
      const protocolsState = {
        ...state,
        selectedProtocols: newProtocols
      };
      
      return saveFiltersAndLog(protocolsState, preState, action.type);
    }
    
    // Ignore protocol actions when not ready - prevents errors during initialization
    case FILTER_STATES.INITIAL:
    case FILTER_STATES.FIRST_VISIT__WAITING:
    case FILTER_STATES.FIRST_VISIT__MISMATCHED:
    case FILTER_STATES.READY__MISMATCHED:
      return state;
    
    default:
      throw new Error(`Invalid state ${preState} for action SET_PROTOCOLS`);
  }
}

function handleReset(state, action) {
  const preState = state.filterState;
  
  switch (preState) {
    case FILTER_STATES.FIRST_VISIT__WAITING:
    case FILTER_STATES.FIRST_VISIT__MISMATCHED:
    case FILTER_STATES.READY__MATCHED:
    case FILTER_STATES.READY__MISMATCHED: {
      const resetState = createResetState(state);
      
      // Don't clear localStorage - it contains other data like logo URLs
      // Just return to INITIAL state with empty filters
      
      return resetState;
    }
    
    default:
      throw new Error(`Invalid state ${preState} for action RESET`);
  }
}

// Main reducer delegates to action handlers
function filterReducer(state, action) {
  const preState = state.filterState;
  
  let nextState;
  switch (action.type) {
    case FILTER_ACTIONS.INIT:
      nextState = handleInit(state, action);
      break;
    case FILTER_ACTIONS.CHAIN_READY:
      nextState = handleChainReady(state, action);
      break;
    case FILTER_ACTIONS.SET_TOKENS:
      nextState = handleSetTokens(state, action);
      break;
    case FILTER_ACTIONS.SET_PROTOCOLS:
      nextState = handleSetProtocols(state, action);
      break;
    case FILTER_ACTIONS.RESET:
      nextState = handleReset(state, action);
      break;
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
  
  console.log(`[FilterReducer] ${preState} -> ${nextState.filterState} (${action.type})`);
  
  return nextState;
}

// Main hook
export function useFilterManager() {
  const { selectedChain, availableProtocols, availableTokens, dataState } = usePoolData();
  
  const [state, dispatch] = useReducer(filterReducer, {
    filterState: FILTER_STATES.INITIAL,
    chain: null,
    selectedTokens: [],
    selectedProtocols: [],
    availableProtocols: [],
    availableTokens: []
  });
  
  // Initialize on mount or chain change
  useEffect(() => {
    if (state.chain !== selectedChain) {
      switch (state.filterState) {
        case FILTER_STATES.READY__MATCHED:
        case FILTER_STATES.READY__MISMATCHED:
        case FILTER_STATES.FIRST_VISIT__WAITING:
        case FILTER_STATES.FIRST_VISIT__MISMATCHED:
          // Reset and reinitialize for new chain
          dispatch({ type: FILTER_ACTIONS.RESET });
          dispatch({ type: FILTER_ACTIONS.INIT, chain: selectedChain });
          break;
          
        case FILTER_STATES.INITIAL:
          // Just initialize
          dispatch({ type: FILTER_ACTIONS.INIT, chain: selectedChain });
          break;
      }
    }
  }, [selectedChain, state.chain, state.filterState]);
  
  // Handle data availability
  useEffect(() => {
    if (dataState === DATA_STATES.READY && availableProtocols.length > 0) {
      dispatch({
        type: FILTER_ACTIONS.CHAIN_READY,
        chain: selectedChain,
        availableProtocols,
        availableTokens
      });
    }
  }, [dataState, availableProtocols, availableTokens, selectedChain]);
  
  // Public API - now passes individual items to reducer
  const toggleToken = useCallback((address, isSelected) => {
    dispatch({ 
      type: FILTER_ACTIONS.SET_TOKENS, 
      token: address, 
      isSelected 
    });
  }, []);
  
  const toggleProtocol = useCallback((protocol, isSelected) => {
    dispatch({ 
      type: FILTER_ACTIONS.SET_PROTOCOLS, 
      protocol, 
      isSelected 
    });
  }, []);
  
  const resetFilters = useCallback(() => {
    dispatch({ type: FILTER_ACTIONS.RESET });
  }, []);
  
  return {
    selectedTokenAddresses: state.selectedTokens,
    selectedProtocols: state.selectedProtocols,
    toggleToken,
    toggleProtocol,
    resetFilters,
    isInitialized: state.filterState !== FILTER_STATES.INITIAL
  };
}