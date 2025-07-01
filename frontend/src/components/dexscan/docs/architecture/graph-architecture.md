# Graph Component Architecture

## Overview

The graph component visualizes DEX pool relationships as an interactive network diagram using vis-network. This document outlines the architecture following single responsibility principle and layered architecture patterns.

## Architecture Principles

1. **Single Responsibility**: Each component has ONE clear job
2. **Layered Architecture**: Clear separation between UI, business logic, data, and configuration
3. **Small Files**: Maximum 40 lines per file for maintainability
4. **No Duplication**: Shared logic extracted to reusable modules
5. **Testability**: Business logic separated from UI rendering

## Layer Architecture

### 1. Presentation Layer (`presentation/`)
**Purpose**: React components for UI rendering only. No business logic.

- **containers/**: Smart components that connect to data
- **components/**: Pure UI components
- **controls/**: Filter and action UI elements
- **tooltips/**: Tooltip display components

### 2. Business Layer (`business/`)
**Purpose**: Application logic, orchestration, and side effects.

- **controllers/**: High-level orchestration (GraphController, TooltipController)
- **network/**: vis-network wrapper and management
- **interactions/**: User interaction handlers (clicks, hovers, touches)

### 3. Data Layer (`data/`)
**Purpose**: Data fetching, transformation, and state management.

- **hooks/**: React hooks for data management
- **transformers/**: Pure functions for data transformation

### 4. Configuration Layer (`config/`)
**Purpose**: Static configuration and constants.

- Network options, colors, styles, constants

## Component Responsibility Mapping

### Presentation Layer
| Component | Responsibility |
|-----------|----------------|
| `GraphView.jsx` | Main graph container component |
| `GraphCanvas.jsx` | Render target for vis-network |
| `TokenSelectionPrompt.jsx` | Empty state when no tokens selected |
| `BlockProgressIcon/` | Display current block progress |
| `GraphControls.jsx` | Control panel container |
| `TokenFilter.jsx` | Token selection UI |
| `ProtocolFilter.jsx` | Protocol selection UI |
| `NodeTooltip.jsx` | Node information display |
| `EdgeTooltip.jsx` | Edge/pool information display |

### Business Layer
| Component | Responsibility |
|-----------|----------------|
| `GraphController.js` | Orchestrate graph lifecycle and components |
| `TooltipController.js` | Manage tooltip show/hide logic |
| `SelectionController.js` | Track and manage selection state |
| `NetworkManager.js` | Wrap vis-network API |
| `NetworkUpdater.js` | Handle network data updates |
| `ClickHandler.js` | Process click events |
| `HoverHandler.js` | Process hover events |

### Data Layer
| Component | Responsibility |
|-----------|----------------|
| `useGraphData.js` | Orchestrate all data hooks |
| `usePoolFiltering.js` | Filter pools by selected tokens/protocols |
| `useNodeGeneration.js` | Generate nodes from pools |
| `useEdgeGeneration.js` | Generate edges from pools |
| `useParallelEdgeSmoothness.js` | Apply edge fanning effect |
| `useTokenLogos.js` | Fetch missing token logos |

## Directory Structure

```
graph/
├── presentation/           # UI Layer
│   ├── containers/
│   │   ├── GraphView.jsx
│   │   └── GraphViewContent.jsx
│   ├── components/
│   │   ├── GraphCanvas.jsx
│   │   ├── TokenSelectionPrompt.jsx
│   │   └── BlockProgressIcon/
│   │       ├── index.jsx
│   │       ├── ProgressMath.js
│   │       └── ProgressSVG.jsx
│   ├── controls/
│   │   ├── GraphControls.jsx
│   │   ├── TokenFilter.jsx
│   │   ├── ProtocolFilter.jsx
│   │   └── ControlActions.jsx
│   └── tooltips/
│       └── [existing tooltip components]
│
├── business/              # Logic Layer
│   ├── controllers/
│   │   ├── GraphController.js
│   │   ├── TooltipController.js
│   │   └── SelectionController.js
│   ├── network/
│   │   ├── NetworkManager.js
│   │   ├── NetworkUpdater.js
│   │   └── helpers/
│   └── interactions/
│       ├── ClickHandler.js
│       └── HoverHandler.js
│
├── data/                  # Data Layer
│   ├── hooks/
│   │   └── [existing hooks]
│   └── transformers/
│       ├── poolToNode.js
│       └── poolToEdge.js
│
├── config/               # Configuration
│   ├── networkOptions.js
│   ├── protocolColors.js
│   ├── nodeStyles.js
│   └── edgeStyles.js
│
├── test/                 # Tests
└── docs/                 # Documentation
```

## Data Flow

```
User Interaction → Presentation Layer → Business Layer → Data Layer
                                    ↑                           ↓
                                    └─────── Updates ←──────────┘
```

1. **User interacts** with UI (clicks, hovers, filters)
2. **Presentation layer** captures events, calls business layer
3. **Business layer** orchestrates logic, updates state
4. **Data layer** transforms data, returns to business layer
5. **Business layer** updates presentation layer
6. **Presentation layer** re-renders with new data

## Migration Guide

### Phase 1: Remove Duplication (High Priority)
1. Delete `graph-manager/` directory entirely
2. Ensure `NetworkManager` handles all vis-network operations
3. Update imports throughout codebase

### Phase 2: Create Business Layer (High Priority)
1. Create `business/controllers/` directory
2. Implement `GraphController` to orchestrate components
3. Implement `TooltipController` for tooltip logic
4. Move interaction handling to `business/interactions/`

### Phase 3: Organize Configuration (Medium Priority)
1. Create `config/` directory
2. Move `protocolColors.js` to `config/`
3. Move network options from `GraphNetworkOptions.js` to `config/networkOptions.js`
4. Extract styles to separate config files

### Phase 4: Restructure Presentation (Medium Priority)
1. Create `presentation/` directory structure
2. Split `GraphControls.tsx` into smaller components
3. Move components to appropriate subdirectories
4. Ensure all components are under 40 lines

### Phase 5: Optimize Data Layer (Low Priority)
1. Create `data/transformers/` for pure functions
2. Extract transformation logic from hooks
3. Improve testability of data transformations

## Benefits

### Maintainability
- Clear file organization makes finding code easy
- Single responsibility makes understanding code simple
- Small files are easier to review and modify

### Testability
- Business logic separated from UI
- Pure transformers can be unit tested
- Controllers can be tested independently

### Scalability
- New features go in appropriate layer
- No confusion about where code belongs
- Easy to add new visualizations or interactions

### Team Collaboration
- Clear boundaries reduce merge conflicts
- Developers can work on different layers
- Onboarding is faster with clear structure

## Example: Adding a New Feature

To add node clustering:

1. **Data Layer**: Add `useNodeClustering.js` hook
2. **Business Layer**: Add `ClusterController.js`
3. **Presentation Layer**: Add `ClusterControls.jsx`
4. **Config**: Add `clusterOptions.js`

Each piece has a clear home and single responsibility.

---