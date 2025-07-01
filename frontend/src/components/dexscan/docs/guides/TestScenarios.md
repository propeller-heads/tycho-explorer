# Graph Hooks Test Scenarios

## Overview
Test scenarios for the refactored graph hooks using the GraphHooksTest component at `/graph-test` route.

## Core Hook Tests

### 1. usePoolFiltering
**Scenario**: Filter pools by tokens and protocols (selected tokens must be superset of pool tokens)
- [x] Select ETH and USDC tokens → Should show 5 pools (2 Uniswap V3, 1 vm:curve, 1 sushiswap_v2, 1 pancakeswap_v3)
- [x] Select ETH, USDC, and DAI → Should show 7 pools (adds vm:balancer_v2 and USDC-DAI vm:curve pool)
- [x] Deselect all tokens → Should show 0 pools
- [x] Select only DAI token → Should show 0 pools (no pool has ONLY DAI)
- [x] Select USDC and DAI → Should show 1 pool (vm:curve USDC-DAI)
- [x] Select DAI and WBTC → Should show 1 pool (Uniswap V2 DAI-WBTC)
- [x] Toggle protocols on/off → Should filter pools by protocol

### 2. useNodeGeneration
**Scenario**: Generate nodes from filtered pools
- [x] With ETH/USDC selected → Should show ETH and USDC nodes
- [x] Add DAI to selection → Should add DAI node
- [x] Check node has logo (image property)
- [x] Token without CDN logo by commenting out local CDN URL loading → Should use API logo or default

### 3. useEdgeGeneration
**Scenario**: Generate edges with protocol styling
- [x] Uniswap V3 selected → Edges should be teal (#2DD4BF)
- [x] Uniswap V2 selected → Edges should be blue (#3B82F6)
- [x] vm:curve selected → Edges should be green (#22C55E)
- [x] vm:balancer_v2 selected → Edges should be orange (#F97316)
- [x] Current block edges → Should have width: 10
- [x] Non-current block → Should have width: 1

### 4. useParallelEdgeSmoothness
**Scenario**: Apply fanning to parallel edges
- [x] ETH-USDC pair → Should show 5 parallel edges with different curves
- [x] First edge → curvedCW with roundness 0.05
- [x] Second edge → curvedCCW with roundness 0.05
- [x] Third edge → curvedCW with roundness 0.20
- [x] Fourth edge → curvedCCW with roundness 0.20
- [x] Fifth edge → curvedCW with roundness 0.35
- [x] Single edges → Should be nearly straight (roundness 0.05)

### 5. useTokenLogos
**Scenario**: Fetch API logos for tokens without CDN logos
- [x] Comment out local CDN URL loading
- [x] Should trigger API calls
- [x] Check apiLogos state
- [x] Logo should appear on node after fetch

## Integration Tests

### 6. Network Manager Update
**Scenario**: Verify network updates without re-initialization
- [ ] Initial load → NetworkManager.initialize called once
- [ ] Add token → NetworkManager.updateData called
- [ ] Remove token → NetworkManager.updateData called
- [ ] Clear all tokens → NetworkManager.destroy called
- [ ] Console should show "Updating network data" not "Initializing"

### 7. Tooltip Interactions
**Scenario**: Click nodes and edges to show tooltips
- [ ] Click ETH node → NodeTooltip appears at click position
- [ ] Shows pool count, address, connections
- [ ] Click edge → EdgeTooltip appears at click position
- [ ] Shows protocol, fee, last update time
- [ ] Click empty space → Tooltips disappear

### 8. Block Number Changes
**Scenario**: Test edge highlighting on block changes
- [ ] Set block to 18500000 → 2 edges should highlight (width: 10)
- [ ] Change block to 18499999 → Different edge highlights
- [ ] Use +/- buttons → Edges update dynamically

### 9. Multi-token Pools
**Scenario**: Test Balancer pool with 3 tokens
- [ ] Select ETH, USDC, DAI → Balancer pool creates 3 edges
- [ ] Each pair (ETH-USDC, ETH-DAI, USDC-DAI) has edge
- [ ] All edges have same protocol color

### 10. Protocol Toggle
**Scenario**: Test protocol filtering
- [ ] Deselect Uniswap V3 → Those edges turn gray
- [ ] Deselect all protocols → All edges gray
- [ ] Re-select protocol → Edges regain color

## Edge Cases

### 11. Empty State
**Scenario**: No tokens selected
- [ ] Should show "select at least two tokens" prompt
- [ ] Graph container should be empty
- [ ] No network initialization

### 12. Single Token
**Scenario**: Only one token selected
- [ ] Should still show prompt (need 2+ tokens)
- [ ] No nodes or edges generated

### 13. Rapid Selection Changes
**Scenario**: Quickly toggle tokens
- [ ] Rapidly select/deselect tokens
- [ ] Network should update smoothly
- [ ] No console errors
- [ ] Viewport should persist

### 14. Data Consistency
**Scenario**: Verify data flow through hooks
- [ ] Hook Details tab → Shows filtered pools
- [ ] Nodes match filtered pool tokens
- [ ] Edge count matches expected pairs
- [ ] Parallel edge count shown correctly

### 15. Performance
**Scenario**: Large selection
- [ ] Select all tokens → Performance should be smooth
- [ ] Check parallel edge calculation time
- [ ] Network rendering should be responsive

## Debug Features

### 16. Console Logging
**When debugging is needed**:
- [ ] Click events log coordinates
- [ ] Tooltip rendering logs position
- [ ] Pool lookup logs found/not found
- [ ] Network updates log action type

### 17. Tab Navigation
**Test different views**:
- [ ] Overview tab → Shows counts
- [ ] Hook Details → Shows raw hook outputs
- [ ] Raw Data → Shows test pool data

## Acceptance Criteria
- All hooks maintain exact same functionality as original monolithic hook
- Network updates efficiently without re-initialization
- Tooltips appear at correct positions
- No console errors during normal operation
- Performance comparable to original implementation