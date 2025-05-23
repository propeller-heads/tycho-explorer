# Project Brief: Tycho Pool Explorer

## 1. Project Name

Tycho Pool Explorer (also referred to as DEX Scan or Pool List View)

## 2. Project Goal

To develop a sophisticated, real-time decentralized exchange (DEX) liquidity pool explorer. The application aims to provide users with a comprehensive and intuitive interface to discover, analyze, and interact with liquidity pools across various protocols. Key features include a detailed pool list view with advanced filtering and sorting, a market graph visualization, and tools like a swap simulator.

## 3. Target Audience

*   DeFi Traders and Analysts
*   Liquidity Providers
*   Arbitrageurs
*   DeFi Developers and Researchers

## 4. Core Requirements & Scope

*   **Real-time Data Display**: Fetch and display live on-chain liquidity pool data via a WebSocket connection (Tycho backend).
*   **Pool List View**:
    *   Display detailed information for each pool (tokens, pool ID, protocol, fee rate, spot price, last update time).
    *   Implement advanced filtering by tokens, protocols, and pool IDs.
    *   Implement robust sorting for key data columns.
    *   Implement infinite scroll for seamless data browsing.
    *   Display summary statistics (total pools, unique tokens, unique protocols).
    *   Provide external links to block explorers for pools and tokens.
*   **Pool Detail View**:
    *   Display detailed information for a selected pool.
    *   Include a "Quote Simulation" tool (`SwapSimulator.tsx`) to estimate swap outcomes.
*   **Market Graph View**:
    *   Visualize relationships between tokens and pools in a graph format.
    *   Display token and protocol logos.
    *   Provide interactive tooltips with detailed information on nodes (tokens) and edges (pools).
*   **User Interface (UI)**:
    *   Adhere strictly to the "TC Design" Figma mockups for visual styling, layout, and user experience. This includes a warm cream/beige color palette, specific typography, blurred panel aesthetics, and gradient borders.
    *   Ensure a responsive and intuitive user experience.
*   **Configuration**: Allow users to configure WebSocket connection settings.
*   **Technology Stack**: React, TypeScript, Tailwind CSS, Radix UI, Vite.

## 5. Key Deliverables

*   A fully functional Pool List View with infinite scroll, filtering, sorting, and TC Design styling.
*   A functional Market Graph View with interactive elements and TC Design styling.
*   A Pool Detail Sidebar with a Swap Simulator.
*   Comprehensive Memory Bank documentation.

## 6. Success Metrics

*   Accurate and real-time display of pool data.
*   Smooth and performant user interface, especially the infinite scroll and graph interactions.
*   Full adherence to the TC Design specifications.
*   Positive user feedback on usability and information clarity.
*   Robust and well-documented codebase.
