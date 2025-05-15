# Block update

Ideally, each block update should contain trades and each trade should contain the direciton of the trade. The richer the data the better.

# Crashing tycho-api

```
2025-05-15T20:29:47.128596Z  INFO handle_msg: tycho_client::deltas: Received a new subscription extractor_id=ExtractorIdentity { chain: Ethereum, name: "uniswap_v4" } subscription_id=60d344bb-655d-41dc-9608-c7beeac4a07c
2025-05-15T20:29:47.128984Z  INFO state_sync{extractor_id=ethereum:uniswap_v4}: tycho_client::feed::synchronizer: Waiting for deltas...
2025-05-15T20:29:47.484839Z  INFO handle_msg: tycho_client::deltas: Received a new subscription extractor_id=ExtractorIdentity { chain: Ethereum, name: "uniswap_v3" } subscription_id=72022236-ad74-466a-befe-e9f9b87bb45f
2025-05-15T20:29:47.485060Z  INFO handle_msg: tycho_client::deltas: Received a new subscription extractor_id=ExtractorIdentity { chain: Ethereum, name: "uniswap_v2" } subscription_id=4e2c0da9-9dd0-43ab-bfec-8c3fd55d8417
2025-05-15T20:29:47.485164Z  INFO handle_msg: tycho_client::deltas: Received a new subscription extractor_id=ExtractorIdentity { chain: Ethereum, name: "vm:balancer_v2" } subscription_id=a2f634d9-782f-428e-99b7-14c8fa575a4c
2025-05-15T20:29:47.485304Z  INFO state_sync{extractor_id=ethereum:vm:balancer_v2}: tycho_client::feed::synchronizer: Waiting for deltas...
2025-05-15T20:29:47.485413Z  INFO state_sync{extractor_id=ethereum:uniswap_v3}: tycho_client::feed::synchronizer: Waiting for deltas...
2025-05-15T20:29:47.485439Z  INFO state_sync{extractor_id=ethereum:uniswap_v2}: tycho_client::feed::synchronizer: Waiting for deltas...
2025-05-15T20:30:02.329383Z  INFO state_sync{extractor_id=ethereum:vm:balancer_v2}: tycho_client::feed::synchronizer: Deltas received. Retrieving snapshot height=22490899
2025-05-15T20:30:02.349365Z  INFO state_sync{extractor_id=ethereum:uniswap_v4}: tycho_client::feed::synchronizer: Deltas received. Retrieving snapshot height=22490899
2025-05-15T20:30:02.645591Z  INFO state_sync{extractor_id=ethereum:uniswap_v3}: tycho_client::feed::synchronizer: Deltas received. Retrieving snapshot height=22490899
2025-05-15T20:30:03.630993Z  INFO state_sync{extractor_id=ethereum:uniswap_v2}: tycho_client::feed::synchronizer: Deltas received. Retrieving snapshot height=22490899
2025-05-15T20:30:16.894123Z  INFO state_sync{extractor_id=ethereum:uniswap_v4}: tycho_client::feed::synchronizer: Initial snapshot retrieved, starting delta message feed n_components=560 n_snapshots=560
2025-05-15T20:30:16.894281Z ERROR tycho_client::feed: Extractor transition to advanced. extractor_id=ExtractorIdentity { chain: Ethereum, name: "uniswap_v4" } last_message_at=2025-05-15T20:29:38.169800768 block=Header { hash: Bytes(0x884e388e40760cacc005d5a00e1d921dc7e962e7c39ae59fa6703d75a29b6724), number: 22490900, parent_hash: Bytes(0x53b50e7403422487ef7f1d2db3186ea2335dde8f4d4a2bdeafa0182a117b3bbc), revert: false }
2025-05-15T20:30:20.977218Z  INFO state_sync{extractor_id=ethereum:uniswap_v3}: tycho_client::feed::synchronizer: Initial snapshot retrieved, starting delta message feed n_components=2678 n_snapshots=2678
2025-05-15T20:30:20.977655Z ERROR tycho_client::feed: Extractor transition to advanced. extractor_id=ExtractorIdentity { chain: Ethereum, name: "uniswap_v3" } last_message_at=2025-05-15T20:29:37.970634476 block=Header { hash: Bytes(0x884e388e40760cacc005d5a00e1d921dc7e962e7c39ae59fa6703d75a29b6724), number: 22490900, parent_hash: Bytes(0x53b50e7403422487ef7f1d2db3186ea2335dde8f4d4a2bdeafa0182a117b3bbc), revert: false }
2025-05-15T20:30:23.899856Z  INFO state_sync{extractor_id=ethereum:vm:balancer_v2}: tycho_client::feed::synchronizer: Initial snapshot retrieved, starting delta message feed n_components=141 n_snapshots=141
2025-05-15T20:30:23.900139Z ERROR tycho_client::feed: Extractor transition to advanced. extractor_id=ExtractorIdentity { chain: Ethereum, name: "vm:balancer_v2" } last_message_at=2025-05-15T20:29:37.970404317 block=Header { hash: Bytes(0x884e388e40760cacc005d5a00e1d921dc7e962e7c39ae59fa6703d75a29b6724), number: 22490900, parent_hash: Bytes(0x53b50e7403422487ef7f1d2db3186ea2335dde8f4d4a2bdeafa0182a117b3bbc), revert: false }
2025-05-15T20:30:35.860682Z  INFO state_sync{extractor_id=ethereum:uniswap_v2}: tycho_client::feed::synchronizer: Initial snapshot retrieved, starting delta message feed n_components=20642 n_snapshots=20642
2025-05-15T20:30:35.861232Z ERROR tycho_client::feed: Extractor transition to advanced. extractor_id=ExtractorIdentity { chain: Ethereum, name: "uniswap_v2" } last_message_at=2025-05-15T20:29:37.970313207 block=Header { hash: Bytes(0x884e388e40760cacc005d5a00e1d921dc7e962e7c39ae59fa6703d75a29b6724), number: 22490900, parent_hash: Bytes(0x53b50e7403422487ef7f1d2db3186ea2335dde8f4d4a2bdeafa0182a117b3bbc), revert: false }
```