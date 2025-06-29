# Vis-Network Viewport Behavior Investigation

## Finding: No Automatic Viewport Reset on Data Updates

After testing and investigation, vis-network does NOT automatically reset the viewport when data is updated through DataSet operations (add/update/remove).

## Expected vs Actual Behavior

### Expected (based on documentation)
- `stabilization.fit: true` should "zoom to fit all nodes when stabilization is finished"
- Data updates trigger stabilization
- Therefore, viewport should reset after data updates

### Actual Behavior
- DataSet updates (add/update/remove) do NOT trigger viewport reset
- Viewport remains at current position and zoom level
- Even with `physics.enabled: true` and `stabilization.fit: true`

## Testing Performed

1. **Test Configuration**:
   ```javascript
   physics: {
     enabled: true,
     stabilization: {
       enabled: true,
       fit: true  // Should cause viewport reset
     }
   }
   ```

2. **Test Steps**:
   - Initialize network with 3 nodes
   - Zoom in and pan to specific area
   - Add/remove nodes via DataSet operations
   - Observe: No viewport reset occurs

## Implications

1. **Viewport Restore Code Not Needed**
   - The `network.moveTo()` call in NetworkUpdater was intended to prevent viewport reset
   - Since no reset occurs, this code is currently unnecessary
   - However, keeping it provides future-proofing if vis-network behavior changes

2. **When Viewport Reset DOES Occur**
   - Initial network creation with `stabilization.fit: true`
   - Calling `network.fit()` explicitly
   - Possibly when using `network.setData()` instead of DataSet operations

## Conclusion

The viewport preservation code in NetworkUpdater can be removed for now, as vis-network maintains viewport position during DataSet updates. The initial assumption about viewport reset behavior was incorrect.