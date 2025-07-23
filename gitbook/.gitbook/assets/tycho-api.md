If you are interested in extending the sub-millisecond Tycho DEX data feed, this page is for you.

This app uses a [custom version](https://github.com/propeller-heads/tycho-explorer/tree/main/api) of the Tycho API [prototype](https://github.com/louise-poole/tycho-api) which you can extend. 

The Tycho AIP Rust crate gives you [an interface](https://github.com/propeller-heads/tycho-explorer/blob/d5ba3ae4576aed14bab4097eca978ba2b1699188/api/src/api/routes.rs#L16) of 1) websocket interface to read all the pool's state 2) HTTP interface for getting quote for a token pair.

For more detail, visit https://docs.propellerheads.xyz/tycho/for-solvers/simulation#main-interface.