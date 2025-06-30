/**
 * Physics options for network
 */
export const getPhysicsOptions = () => ({
  enabled: true,
  solver: 'barnesHut',
  barnesHut: {
    gravitationalConstant: -25000,
    centralGravity: 0.15,
    springLength: 250,
    springConstant: 0.04,
    damping: 0.09,
    avoidOverlap: 0.7
  },
  stabilization: {
    enabled: true,
    iterations: 2000,
    updateInterval: 25,
    onlyDynamicEdges: false,
    fit: true  // This causes viewport reset after stabilization
  },
  timestep: 0.5,
  adaptiveTimestep: true
});

/**
 * Layout options for network
 */
export const getLayoutOptions = () => ({
  randomSeed: 42,
  improvedLayout: true,
  hierarchical: {
    enabled: false
  }
});

/**
 * Interaction options for network
 */
export const getInteractionOptions = (isMobile) => ({
  hover: true,
  tooltipDelay: 200,
  dragNodes: true,
  dragView: true,
  zoomView: true,
  zoomSpeed: 0.5,
  multiselect: false,
  navigationButtons: false,
  selectConnectedEdges: true,
  hoverConnectedEdges: true,
  hideEdgesOnDrag: false,
  hideEdgesOnZoom: false
});