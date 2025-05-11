# Product Context: Pool Explorer

## Motivation

The Pool Explorer aims to address several key challenges and opportunities in the DeFi space:

1.  **Speed, Precision, and Breadth**: Existing third-party web UIs for exploring DEX pools are often slow due to network latency, limiting as they don't share the entire dataset, and incomplete (missing tokens/pools or delayed updates). This project seeks to provide an uncompromising UI built on Tycho, offering:
    *   Verifiable data reliability.
    *   Complete data (no pool or token missing).
    *   Very low latency (local, efficiently implemented).

2.  **Trustless Source for DEX Liquidity**: A reliable, trustless explorer for on-chain liquidity is valuable for informed decision-making in areas such as:
    *   Competitive analysis (DEX/token).
    *   Trading strategies.
    *   Yield optimization.
    *   Calculating collateral factors.
    *   Market reporting.

3.  **On-Ramp to DIY Use-Cases**: A good UI can help users understand the data and inspire them to build their own tools, such as automated LP management, liquidation risk reports, trading bots, and solvers.

4.  **Open Information about DEX Liquidity**: While block data on DEX liquidity is theoretically open, it's difficult to parse, especially across different DEXs. This UI aims to provide a complete view of on-chain liquidity to anyone interested, democratizing access to information currently held by a few analysis firms, solvers, and routers.

5.  **Birdseye View of the Market**: The UI will help users visualize pools and their relationships, understand market structure, and see how liquidity is connected. This perspective can inform:
    *   **DEXs**: Identify competitive positioning and areas for improvement (e.g., under-liquid tokens).
    *   **Token Projects**: Spot gaps in trading paths and determine which pools to deploy for better prices and volume.
    *   **Traders**: Gain an intuitive understanding of available liquidity.

## User Scenarios

The Pool Explorer is designed to cater to various user needs:

1.  **As a DEX – Understand Competition**:
    *   **Goal**: Compare own pools to all other pools on the same token pair.
    *   **Metrics**: TVL, depth, fee, gas cost, delta to mid-price.
    *   **Outcome**: Decide where to incentivize liquidity.

2.  **As a Protocol – Understand Liquidity Health**:
    *   **Goal**: Get an overview of liquidity tradable for the protocol's token.
    *   **Features**: List of all pools (with DEX name, TVL, tokens, pool address, depth at 0.5%, 1%, 2%), graph view, simulation of routed swaps to see token's position on optimal paths.

3.  **As a Trader – Understand Liquidity**:
    *   **Goal**: Get a detailed view of TVL and liquidity distribution (list view) and an intuitive understanding of market structure (graph view).

4.  **As a Protocol – Understand Competition (Broader Market)**:
    *   **Goal**: Understand competition with similar token dynamics (e.g., Stablecoins, Restaking Tokens, Wrapped Tokens).
    *   **Metrics**: Compare TVL, depth, and appearance on optimal swap paths.

## Design Philosophy (TC Design)

The project refers to Figma mockups as "TC Design." The implementation should liberally download and use assets from these mockups. The provided links are:

*   **Background Mockup**: [https://www.figma.com/design/f0WDvjnB7zph0s0VJPAaWV/ph-website-v1?node-id=7895-5185&m=dev](https://www.figma.com/design/f0WDvjnB7zph0s0VJPAaWV/ph-website-v1?node-id=7895-5185&m=dev)
*   **List View with Tools Expanded**: [https://www.figma.com/design/f0WDvjnB7zph0s0VJPAaWV/ph-website-v1?node-id=7677-8074&m=dev](https://www.figma.com/design/f0WDvjnB7zph0s0VJPAaWV/ph-website-v1?node-id=7677-8074&m=dev)
*   **List View**: [https://www.figma.com/design/f0WDvjnB7zph0s0VJPAaWV/ph-website-v1?node-id=7675-7578&m=dev](https://www.figma.com/design/f0WDvjnB7zph0s0VJPAaWV/ph-website-v1?node-id=7675-7578&m=dev)
*   **Graph View**: [https://www.figma.com/design/f0WDvjnB7zph0s0VJPAaWV/ph-website-v1?node-id=7903-5193&m=dev](https://www.figma.com/design/f0WDvjnB7zph0s0VJPAaWV/ph-website-v1?node-id=7903-5193&m=dev)

## Rationale for Local UI

*   **Critical Use-Cases**: Users making financial decisions prefer not to rely on third-party APIs.
*   **Performance Needs**: Many users require higher throughput and lower latency for faster analyses on more complete and larger datasets.
*   **Onboarding Programmatic Users**: A UI can make it easier to understand data possibilities and validate data accuracy, thereby onboarding developers who will use the underlying data programmatically.

## Source Document

This product context is derived from `docs/specification.md`.
