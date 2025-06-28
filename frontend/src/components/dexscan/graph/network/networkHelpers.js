/**
 * Helper functions for network data diffing
 */

export const diffNodes = (currentNodes, newNodes) => {
  const currentMap = new Map(currentNodes.map(n => [n.id, n]));
  const newMap = new Map(newNodes.map(n => [n.id, n]));
  
  const toAdd = newNodes.filter(n => !currentMap.has(n.id));
  const toUpdate = newNodes
    .filter(n => currentMap.has(n.id))
    .map(({ x, y, ...node }) => node); // Exclude position
  const toRemove = Array.from(currentMap.keys()).filter(id => !newMap.has(id));
  
  return { toAdd, toUpdate, toRemove };
};

export const diffEdges = (currentEdges, newEdges) => {
  const currentMap = new Map(currentEdges.map(e => [e.id, e]));
  const newMap = new Map(newEdges.map(e => [e.id, e]));
  
  const toAdd = newEdges.filter(e => !currentMap.has(e.id));
  const toUpdate = newEdges.filter(e => currentMap.has(e.id));
  const toRemove = Array.from(currentMap.keys()).filter(id => !newMap.has(id));
  
  return { toAdd, toUpdate, toRemove };
};