import { getPhysicsOptions, getLayoutOptions, getInteractionOptions } from '@/components/dexscan/graph/network/networkOptionsHelpers';

/**
 * Default options for vis-network
 */
export const getDefaultNetworkOptions = (isMobile = false) => ({
  autoResize: false,
  nodes: {
    shape: "circle",
    size: 32,
    color: {
      border: "transparent",
      background: "transparent",
      highlight: {
        border: "#FF3366",
        background: "transparent"
      },
      hover: {
        border: "transparent",
        background: "transparent"
      }
    },
    borderWidth: 0,
    borderWidthSelected: 2,
    font: {
      size: 16,
      color: "rgba(255, 244, 224, 1)",
      face: "Inter, Arial, sans-serif",
      vadjust: 0
    },
    physics: true
  },
  edges: {
    width: 1,
    color: {
      color: "rgba(255, 244, 224, 0.15)",
      highlight: "rgba(255, 244, 224, 0.4)",
      hover: "rgba(255, 244, 224, 0.4)",
      inherit: false
    },
    smooth: {
      enabled: true,
      type: "continuous",
      roundness: 0.05
    }
  },
  physics: getPhysicsOptions(),
  layout: getLayoutOptions(),
  interaction: getInteractionOptions(isMobile)
});