# Pool Explorer

# tldr;

A local UI to explore DEX pools. Filter for, and explore DEX pools, with low-latency, full coverage and trustlessly reliable data.


# Motivation

- **Speed, precision and breadth**: Today, there are only 3rd party web UIs to explore available DEX pools. However, they are slow (network latency), limiting (do not share the entire dataset), and incomplete (do not list all tokens, all pools, or only with delay after launch). – Instead let's build an uncompromising UI on Tycho: Verifiable data reliability, complete data (no pool or token is missing), and very low latency (local, efficiently implemented). So you can find any pool, filter fast, and explore the entire set of DEX pools visually.

- **Trustless source on DEX liquidity for better decisions**: A trustless, robust, explorer to read and know the on-chain liquidity in real-time is valuable for decision: Such as competitive analysis (DEX / token), trading, yield optimisation, calculating collateral factors, and market reports.

- **On-ramp to DIY use-cases**: A good UI helps understand the data – and can inspire users to build implement their own tools against it – such as automated LP, producing liquidation risk reports, trading, solving or many other.

- **Open Information about DEX liquidity**:  The block data on DEX liquidity is theoretically open to anyone. But it's very hard to parse, especially across different DEXs. Today no-one but a few analysis firms, solvers and routers have an accurate, complete and real-time view of the onchain liquidity. This UI will open a complete view to anyone who's interested.

- **Birdseye view**: See the pools and their relation, understand the structure of the market. Use it to get a better understanding of how liquidity is connected, how your pool fits into the larger whole, and how you can compete. This birdseye view can inform many in their decision making: 
	- DEXs can see how they fit into the market and what they should focus on (e.g. tokens that are not liquid enough)
	- Token projects identify gaps in trading paths – and see which pools they need to deploy to improve prices for traders and win more volume.
	- Traders can get a more intuitive understanding of available liquidity (for their trade).

# Goal

Make on-chain liquidity easy to observe and explore, directly, through a local, filterable pool list and pool graph.

# Specification

## User Scenarios

- **As a DEX – Understand Competition**: As a DEX I want to compare my pools to all other pools on the same token pair, and see how my pool compares based on TVL, depth, fee, gas cost and delta to mid-price. To help decide where I should incentivise liquidity. 

- **As a Protocol – Understand liquidity health**: As a protocol with a token I want an overview of the liquidity that is tradable for my token: A list of all pools, with DEX name, TVL, tokens, pool address, depth (at 0.5, 1, 2%). A graph view. Simulating routed swaps to see when my token, and which pool, is on the optimal path.

- **As a Trader – Understand liquidity:** As a trader, and general defi user, I'd like a detailed view of TVL and liquidity distribution (list view) – and also get an intuitive understanding for the market structure (graph view).

- **As a Protocol – Understand competition**: As a protocol competing with others on similar token dynamics (e.g. Stablecoin, Restaking Token, Wrapped Token) I want to understand my competition and know where my token stands: How do I compare on TVL, depth, and appearing on optimal swap paths.

## Requirements

### Essential Requirements

- **Pool list view**: Columns: Tokens, Pool ID, Fee rate, Spot price, Protocol, Last update
	- **Filter option**: Let the user sort and filter by tokens, protocols and pool IDs.
	- **Default sort**: Most recent updates first (by Last update descending)

-  **Graph View**: Show pools (of current filter view) in graph view (nodes are tokens, edges are pools).

- **Current block**: Indicate the block on which the data the user sees is based (both graph and list view) – increment it live as new block updates come in.

### Important Requirements

- **Graph View**
	- **Graph View Detail**: Click on a node, see total TVL for the token, number of pools, top 5 pools sorted by TVL with TVL, protocol name, last trade timestamp.
	- **Scale nodes by TVL**: Scale node volume by TVL (or by log TVL).
  - **Simulate on the pool**: Simulate any swap you want on the pool: One direction or another (perhaps with flip switch), select any amount with a slider on a logarithmic scale from 0 to the pool limit (limit is available in protocol component).

  - **Edge Coloring**: Color the edges by the protocol they belong to (e.g. Uniswap v4).

  - **Filter option**: Let the user filter the graph by protocol (multiselect), minimum pool TVL, and tokens to include (multi select - with search field to find tokens).

  - **Show latest update on graph**: Highlight all edges (pools) that have been updated in the last block - by flashing them and making them fat until the next block update comes in.

- **Overall Metrics**: 
	- **Total number of pools indexed**
	- **Total number of contracts / protocols indexed**
	- **Total TVL indexed**

- **Filter view Metrics:**
	- **Total number of pools in current filter view**
	- **Total TVL in current filter view**

## Definitions

- **TVL**: Total value locked in a liquidity pool. The sum total of all tokens, denominated in a common numeraire (commonly USDC or ETH).

- **Protocol**: The set of smart contracts comprising a protocol which also contain one or multiple liquidity pools. (Can be a DEX, but also e.g. a lending protocol).

# Design

*This is a language-agnostic architecture draft to illustrate the core components, data structures, and operations. Implement in any stack you like.*

# Rationale

- **Criticial use-cases don't want to rely on third party APIs**: Users who make financial decisions based on this data – do not want to rely on third party data.

- **Many users have higher throughput and lower latency requirements**: Many users need, or at least significantly benefit, from being able to do much faster analyses, on more complete and larger scale pool data.

- **UIs onramp programmatic users**: The UI makes it easier to imagine ways to use the data, and to validate the breadth and accuracy of the data. So a UI can also onboard developers who will use the underlying data programatically.

# Risks

- **Meaningful difference to DEX explorers**: Web-based, third-party, DEX explorers already exist. Data is not verifiable, complete or openly accessible – but users might not value lower latency, more reliability, accuracy and larger breadth enough.

# Figma Mockups

The following links are the mockups for various screens in the app, what we shall call the TC Design. Be liberal in downloading assets from them.

# Mockups

## Background mockup

https://www.figma.com/design/f0WDvjnB7zph0s0VJPAaWV/ph-website-v1?node-id=7895-5185&m=dev

## List view with tools expanded

https://www.figma.com/design/f0WDvjnB7zph0s0VJPAaWV/ph-website-v1?node-id=7677-8074&m=dev

## List view

https://www.figma.com/design/f0WDvjnB7zph0s0VJPAaWV/ph-website-v1?node-id=7675-7578&m=dev

## Graph view

https://www.figma.com/design/f0WDvjnB7zph0s0VJPAaWV/ph-website-v1?node-id=7903-5193&m=dev

## Token and protocol filter in Graph View

https://www.figma.com/design/f0WDvjnB7zph0s0VJPAaWV/ph-website-v1?node-id=7673-6974&t=rXP5U90rz4Te6DVr-4

## Token and protocol popovers 

https://www.figma.com/design/f0WDvjnB7zph0s0VJPAaWV/ph-website-v1?node-id=7673-6973&m=dev

# Domain concepts

* There is only pool ID, pool adderss doesn't exist. For example, uniswap v4 uses ID to find pool data, a pool doesn't have its own address.