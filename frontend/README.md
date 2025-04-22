# Quick start

chmod +x start.sh

./start.sh --parallel

# Logic organization

1. Root Component Structure:
- DexScanContent (root) wraps DexScanContentMain with PoolDataProvider
- Uses React Context for state management and data sharing
2. Data Management:
- PoolDataContext provides centralized state for pool data
- Manages WebSocket connections for real-time data
- Includes fallback to mock data when disconnected
- Handles reconnection logic with configurable attempts
3. View Components:
- ListView displays pool data in a tabular format
- PoolTable handles sorting, filtering, and pagination
- ViewSelector toggles between view modes
4. Pool Details:
- SwapSimulator provides trading simulation
- Uses specialized components (SwapControls, SwapResults)
5. Connection Management:
- WebSocketConfig allows users to configure connection settings
- Visual indicators for connection status

Data management is centrally managed in the context while UI components focus on rendering and user interactions.
