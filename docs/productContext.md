# Product Context: Tycho Pool Explorer

## 1. Why This Project Exists

The Tycho Pool Explorer aims to address the growing need for sophisticated tools to navigate the complex and rapidly evolving landscape of decentralized finance (DeFi) liquidity pools. Existing solutions often lack real-time data, comprehensive filtering, or an intuitive user experience that aligns with modern design standards. This project seeks to provide a superior alternative for users who need to discover, analyze, and understand DEX liquidity in depth.

## 2. Problems It Solves

*   **Information Overload**: The sheer number of liquidity pools across various protocols makes it difficult for users to find relevant opportunities or track specific pools.
*   **Data Latency**: Many existing tools do not provide truly real-time on-chain data, which is crucial for time-sensitive DeFi operations.
*   **Poor User Experience**: Cluttered interfaces, inefficient navigation (e.g., traditional pagination), and lack of advanced filtering/sorting hinder effective data exploration.
*   **Lack of Visual Clarity**: Difficulty in understanding relationships between tokens and pools without effective visualization tools.
*   **Inadequate Simulation Tools**: Users often lack accessible tools to simulate potential swaps and understand price impact before executing trades.

## 3. How It Should Work (User Experience Goals)

*   **Intuitive Navigation**: Users should be able to easily switch between different views (Pool List, Market Graph) and access detailed information without friction.
*   **Seamless Data Exploration**: The Pool List View should allow users to browse through a large number of pools effortlessly using infinite scroll, rather than clicking through pages.
*   **Powerful Data Interaction**: Users should have access to robust filtering (by tokens, protocols, pool IDs) and sorting capabilities to quickly find the data they need.
*   **Visually Appealing & Modern Interface**: The application must strictly adhere to the "TC Design" Figma mockups, offering a polished, aesthetically pleasing, and information-dense interface. This includes a warm cream/beige color palette, specific typography, blurred panel aesthetics, and gradient borders.
*   **Real-time Insights**: Data should update in real-time, reflecting the current state of the blockchain, with clear indicators like block timers.
*   **Focused Interaction**: When a pool is selected, details and tools (like the Swap Simulator) should be presented in a dedicated, non-intrusive overlay sidebar, keeping the main view clean.
*   **Clear Visualizations**: The Market Graph should provide an easy-to-understand visual representation of token-pool relationships, with interactive elements for deeper exploration.
*   **Actionable Information**: Users should be able to quickly access external block explorers for pools and tokens directly from the interface.

## 4. Key User Scenarios

*   **Discovering New Pools**: A user wants to find new liquidity pools for specific tokens or protocols that meet certain criteria (e.g., fee rate, recent activity).
*   **Analyzing Pool Performance**: A user wants to sort pools by spot price or last update time to identify trends or active markets.
*   **Simulating Swaps**: A user, after finding an interesting pool, wants to simulate a swap to understand potential price impact and output before committing to a trade.
*   **Visualizing Market Structure**: A user wants to use the Market Graph to understand how different tokens are interconnected through various liquidity pools.
*   **Monitoring Real-time Activity**: A user wants to observe the latest block updates and see how pool data changes in near real-time.
