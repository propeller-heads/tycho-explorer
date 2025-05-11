# Project Brief: Pool Explorer

## TLDR;

A local UI to explore Decentralized Exchange (DEX) pools. It enables users to filter for and explore DEX pools with low-latency, full data coverage, and trustlessly reliable data.

## Core Goal

The primary goal of the Pool Explorer is to make on-chain liquidity easy to observe and explore directly. This is achieved through a local, filterable pool list and an interactive pool graph.

## Essential Requirements

As defined in the project specification, the essential features are:

1.  **Pool List View**:
    *   **Columns**: Must display Token1, Token2, TVL (Total Value Locked, in USDC), Protocol, Last Transaction (block number of last update), and Last Update Time.
    *   **Filtering**: Users must be able to sort and filter the list by token, protocol, and TVL.

2.  **Graph View**:
    *   **Representation**: Must show pools from the current filter view in a graph format where nodes represent tokens and edges represent pools.

3.  **Current Block Indicator**:
    *   **Display**: Both the list view and graph view must indicate the block number on which the displayed data is based.
    *   **Live Updates**: This block number should increment live as new block updates are received.

## Source Document

This brief is derived from `docs/specification.md`.
