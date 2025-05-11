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

- **Pool list view**: Columns: Token1, Token2, TVL (in USDC), Protocol, Last Tx (last update) block number, Last update time
	- **Filter option**: Let the user sort and filter token, protocol and TVL.

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

### Nice-to-have requirements

- **Simulate trading curve in realtime**: On a single pool (either in graph view and/or list view when you click on the pool) you allow the user to simulate 1.000 sample points (even log spacing between 0 and pool limit) in one click, in real-time. In front of the users eyes, dot-by-dot, the UI "draws out" the amount in / amount out curve as the simulations (with Tycho Simulation) run through sequentially. To illustrate the speed of the simulation.

- **Path finder**: Given an in-token and an out-token find all paths of length 2-4 through the graph and highlight those paths.
	- **Most liquid**: Highlight the path that goes through the sequence of most liquid pools (the path that has the most liquid lowest-liquidity leg).

- **DEX Event timeline:** A timeline of all events in real-time. With every new block update add all events from the latest block. Events include: DEX name, pool address, tokens. If you click on it you can view the raw json update from the event. Show the last X (e.g. 200) events.

- **Visual Solving**: Given an in-token, out-token and in-token amount ("sell amount") – Run a solver (e.g. find all paths of depth 1-3 from in-token to out-token, then check the price on all paths), and visualize what's happening on the graph in realtime. (e.g. 1. All the paths found light up, then every path flashes as it is being simulated with Tycho Simulation and turns another color once it has been simulated, after all simulation ran through the best path is highlighted. Then in the end you show some metrics "found 250 paths, simulated in average time of 1ms / path, best path is X with price Y, and show the list of all paths and their price in a sorted list (from best to worst)").

- **Execute the swap**: Add a modal to execute swaps: Both in the single pool view (execute any amount you simulated) and the visual solver finder to let users execute on the pool / or swap path.

- **% depth**: Calculate 0.5, 1 and 2% depth for every pool. Recalculate for every pool after it had an update. Show the depth (in USD) in the pool list view, and the pool detail card in the graph view.

- **Two token filter**: Let users select multiple tokens in the token filter in the list view – so that you can effectively filter for all pools of a given token pair (or triplet for pools with more tokens). Take care that you display both (A,B) and (B,A) for a filter of [A,B] - token order-idempotent. (This plus % depth lets DEXs compare their pools competitiveness).

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

