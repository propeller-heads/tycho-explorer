// Physics configuration for graph layout
const getPhysicsOptions = () => ({
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
    fit: false
  },
  timestep: 0.5,
  adaptiveTimestep: true
});

// Layout configuration
const getLayoutOptions = () => ({
  randomSeed: 42,
  improvedLayout: true,
  hierarchical: { enabled: false }
});

// Interaction configuration
const getInteractionOptions = (isMobile) => ({
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

// Network configuration options for vis-network
export const getNetworkOptions = (isMobile) => ({
  autoResize: false,
  nodes: {
    shape: "circle",
    size: 32,
    color: {
      border: "transparent",
      background: "transparent",
      highlight: {
        border: "#FF3366",
        background: "transparent",
      },
      hover: {
        border: "transparent",
        background: "transparent",
      }
    },
    borderWidth: 0,
    borderWidthSelected: 2,
    font: {
      size: 16,
      color: "rgba(255, 244, 224, 1)",
      face: "Inter, Arial, sans-serif",
      vadjust: 0,
    },
    physics: true,
  },
  edges: {
    width: 1,
    color: {
      color: "rgba(255, 244, 224, 0.15)",
      highlight: "rgba(255, 244, 224, 0.4)",
      hover: "rgba(255, 244, 224, 0.4)",
      inherit: false,
    },
    smooth: {
      enabled: true,
      type: "continuous",
      roundness: 0.05
    },
  },
  physics: getPhysicsOptions(),
  layout: getLayoutOptions(),
  interaction: getInteractionOptions(isMobile)
});