# Filter System Refactoring Plan

## Overview
This document describes the refactoring of the filter system to use a reducer pattern with explicit state machines, moving side effects into the reducer and properly modeling "first visit" state.

## Architecture

### State Machine
```
┌─────────────┐    INIT    ┌──────────────┐   CHAIN_READY  ┌─────────┐
│   INITIAL   │──────────▶│ FIRST_VISIT  │───────────────▶│  READY  │
│(no storage) │           │(auto-select) │                 │         │
└─────────────┘           └──────────────┘                 └─────────┘
       │                                                          ▲
       │ INIT (has storage)                                      │
       └─────────────────────────────────────────────────────────┘
                                                                 │
                                                            RESET │
                                                                 │
                                                         ┌─────────────┐
                                                         │   INITIAL   │
                                                         └─────────────┘

States:
- INITIAL: No filters loaded yet
- FIRST_VISIT: First time user visits chain (no localStorage entry)
- READY: Filters loaded and available data received

Actions:
- INIT: Initialize filters from localStorage (from INITIAL only)
- CHAIN_READY: Available protocols/tokens loaded (from FIRST_VISIT or READY)
- SET_TOKENS: Update selected tokens (from READY only)
- SET_PROTOCOLS: Update selected protocols (from READY only)
- RESET: Clear all filters and return to INITIAL (from READY only)
```

## Key Design Decisions

### 1. ENUMs for States and Actions
- Prevents typos and magic strings
- Clear contract between components
- DATA_STATES exported from PoolDataContext

### 2. Pre-State Validation
- Each state explicitly defines valid actions
- Invalid state/action combinations throw errors (bugs)
- No silent failures or unexpected behavior

### 3. Side Effects in Reducer
- localStorage operations happen directly in reducer
- Clear visibility of what happens in each transition
- No useEffect coordination issues

### 4. First Visit State
- Explicitly modeled in state machine
- Auto-select all protocols only on first visit
- Clear differentiation from returning users

### 5. Clean Abstractions
- `createToggleHandler` reduces duplication
- Common pattern for token/protocol toggles
- Easier to extend for new filter types

## Implementation

### PoolDataContext Changes

```javascript
// Export DATA_STATES enum
export const DATA_STATES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  WAITING: 'waiting',
  READY: 'ready'
};

// Add to context value:
{
  dataState: DATA_STATES.DISCONNECTED | DATA_STATES.CONNECTING | DATA_STATES.WAITING | DATA_STATES.READY,
  availableProtocols: string[],
  availableTokens: Token[],
}
```

### useFilterManager Structure

```javascript
import { usePoolData, DATA_STATES } from '@/components/dexscan/shared/PoolDataContext';

// State ENUMs
const FILTER_STATES = {
  INITIAL: 'INITIAL',
  FIRST_VISIT: 'FIRST_VISIT', 
  READY: 'READY'
};

// Action ENUMs
const FILTER_ACTIONS = {
  INIT: 'INIT',
  CHAIN_READY: 'CHAIN_READY',
  SET_TOKENS: 'SET_TOKENS',
  SET_PROTOCOLS: 'SET_PROTOCOLS',
  RESET: 'RESET'
};

// Reducer with pre-state checks and logging
function filterReducer(state, action) {
  const preState = state.filterState;
  let nextState;
  
  switch (state.filterState) {
    case FILTER_STATES.INITIAL: {
      switch (action.type) {
        case FILTER_ACTIONS.INIT: {
          // Load from localStorage
          const stored = loadFromLocalStorage(action.chain);
          
          if (!stored.hasProtocolsEntry) {
            nextState = {
              ...state,
              filterState: FILTER_STATES.FIRST_VISIT,
              chain: action.chain,
              selectedTokens: stored.selectedTokens
            };
          } else {
            nextState = {
              ...state,
              filterState: FILTER_STATES.READY,
              chain: action.chain,
              selectedTokens: stored.selectedTokens,
              selectedProtocols: stored.selectedProtocols
            };
          }
          console.log(`[FilterReducer] ${preState} -> ${nextState.filterState} (${action.type})`);
          return nextState;
        }
        default:
          throw new Error(`Invalid action ${action.type} in state ${state.filterState}`);
      }
    }
    // ... other states
  }
}
```

## Benefits

1. **Predictable State Management**
   - Clear state transitions
   - No race conditions
   - Easy to debug

2. **Simplified Views**
   - Views just consume filter state
   - No business logic in components
   - Clear separation of concerns

3. **Better Error Handling**
   - Crashes on bugs (invalid transitions)
   - Easier to identify issues
   - No silent failures

4. **Maintainability**
   - Single source of truth
   - Clear interfaces
   - Easy to extend

## Chain Switching Behavior

### State-Aware Chain Switching
When the selected chain changes, the behavior depends on the current state:

```javascript
// Initialize on mount or chain change
useEffect(() => {
  if (state.chain !== selectedChain) {
    if (state.filterState === FILTER_STATES.READY) {
      // Chain switch while app is running - reset then init
      dispatch({ type: FILTER_ACTIONS.RESET });
      dispatch({ type: FILTER_ACTIONS.INIT, chain: selectedChain });
    } else if (state.filterState === FILTER_STATES.INITIAL) {
      // First mount or recovering from connection failure - just init
      dispatch({ type: FILTER_ACTIONS.INIT, chain: selectedChain });
    }
    // If we're in FIRST_VISIT, we wait for CHAIN_READY to transition
  }
}, [selectedChain, state.chain, state.filterState]);
```

This prevents crashes when:
- WebSocket connection fails (state remains INITIAL)
- User switches chains while app is running (state is READY)
- App is in the middle of loading data (state is FIRST_VISIT)

## Debugging

### State Transition Logging
All state transitions are logged for debugging:
```
[FilterReducer] INITIAL -> FIRST_VISIT (INIT)
[FilterReducer] FIRST_VISIT -> READY (CHAIN_READY)
[FilterReducer] READY -> INITIAL (RESET)
```

## Migration Steps

1. Write this documentation
2. Delete `usePersistedFilters.ts`
3. Rewrite `useFilterManager.js` with reducer
4. Update `PoolDataContext.tsx` with derived data
5. Update view components to use new system
6. Fix chain switching to be state-aware
7. Add state transition logging
8. Test all edge cases

## Testing Considerations

- Test state transitions
- Test localStorage persistence
- Test first visit behavior
- Test chain switching from different states
- Test WebSocket connection failure scenarios
- Test race condition scenarios