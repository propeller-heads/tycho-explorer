# How to deploy locally?

The app is hosted on [poolexplorer.art](https://github.com/propeller-heads/tycho-explorer/blob/main/gitbook/poolexplorer.art). **But you can also host yourself.**

The benefits hosting yourself:

* lower latency between each chain and visualization update
* you can customize this app to add or edit visualization

## Deploy locally

Before you start, make sure you have **Docker** installed.

```bash
# Clone the repository
git clone git@github.com:propeller-heads/tycho-explorer.git
cd tycho-explorer

# Copy config for deploying in developement mode verbatim
# Get a RPC for Ethereum e.g. from https://dashboard.alchemy.com/apps/new
# The Explorer uses the RPC to get contract code for VM-based contract processing e.g. for Curve and Balancer.
cp .env.example .env.dev    

# Start development environment
# The app will be served over localhost:5173.
# Be patient while the app takes a few minutes to finishing indexing the data; the logs should tell the indexing progress.
make up DEV=1

```

When in doubt, do `make` to see the list of commands to start or stop the sub-services of Tycho Explorer, or view their logs.
