import { diffNodes, diffEdges } from '@/components/dexscan/graph/network/networkHelpers';

/**
 * Updates network data while preserving viewport
 */
export const updateNetworkData = (network, nodesDataset, edgesDataset, nodes, edges) => {
  // Experimentally confirmed vis-network doesn't reset viewport (pan, zoom) on add/remove/update
  // So no need to manually restore viewport
  // const viewPosition = network.getViewPosition();
  // const scale = network.getScale();
  
  // Update nodes
  const currentNodes = nodesDataset.get();
  const { 
    toAdd: nodesToAdd, 
    toUpdate: nodesToUpdate, 
    toRemove: nodeIdsToRemove 
  } = diffNodes(currentNodes, nodes);
  
  if (nodesToAdd.length) nodesDataset.add(nodesToAdd);
  if (nodesToUpdate.length) nodesDataset.update(nodesToUpdate);
  if (nodeIdsToRemove.length) nodesDataset.remove(nodeIdsToRemove);
  
  // Update edges
  const currentEdges = edgesDataset.get();
  const { 
    toAdd: edgesToAdd, 
    toUpdate: edgesToUpdate, 
    toRemove: edgeIdsToRemove 
  } = diffEdges(currentEdges, edges);
  
  if (edgesToAdd.length) edgesDataset.add(edgesToAdd);
  if (edgesToUpdate.length) edgesDataset.update(edgesToUpdate);
  if (edgeIdsToRemove.length) edgesDataset.remove(edgeIdsToRemove);
  
  // Restore viewport
  // network.moveTo({ position: viewPosition, scale, animation: false });
};