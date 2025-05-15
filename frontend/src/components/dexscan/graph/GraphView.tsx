import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';

// Define the network options
// const networkOptions = {
//   nodes: {
//     shape: "circle", // Changed from "box" to "circle"
//     size: 25, // Default size (radius) for circle nodes, adjust as needed
//     color: {
//       border: "#FFF4E0", 
//       background: "#232323", 
//       highlight: { 
//         border: "#FFFFFF", 
//         background: "rgba(255, 244, 224, 0.1)" 
//       }
//     },
//     borderWidth: 1, 
//     font: { 
//       size: 14, 
//       color: "#FFF4E0" 
//     },
//     // widthConstraint and heightConstraint.valign are less relevant for circles, 
//     // label fitting is managed by node size and font margin.
//     margin: { top: 8, right: 8, bottom: 8, left: 8 }, // Adjust margin for label inside circle
//     fixed: {
//       // This can be used later if specific nodes need to be fixed
//     }
//   },
//   edges: {
//     smooth: {
//       enabled: true, 
//       type: "continuous", 
//       roundness: 0 // Add roundness to satisfy TypeScript, 0 for straighter lines
//     },
//     color: {
//       color: "rgba(255, 244, 224, 0.07)", // Default subtle edge color from Figma
//       highlight: "rgba(255, 244, 224, 0.2)", // Brighter on hover
//       hover: "rgba(255, 244, 224, 0.2)",
//     },
//     width: 1, // Default edge width from Figma
//     hoverWidth: 1.5, // Slightly thicker on hover
//   },
//   physics: {
//     barnesHut: {
//       springLength: 800,
//       gravitationalConstant: -2000,
//     },
//     solver: "repulsion",
//     repulsion: {
//       nodeDistance: 600 // Put more distance between the nodes.
//     }
//   },
//   layout: {
//     randomSeed: 42,
//     improvedLayout: false
//   }
// };

const networkOptions = {
  // autoResize: false,
  nodes: {
    shape: "circle",
    color: {
      border: "#ffffff",
      background: "#232323",
      highlight: {
        border: "#000000",
        background: "#F66733",
      }
    },
    borderWidth: 1,
    borderWidthSelected: 3,
    font: {
      size: 10,
      color: "#ffffff",
      face: "monospace",
    },
    size: 20,
  },
  physics: {
    // solver: "repulsion",
    // repulsion: {
    //     nodeDistance: 70,
    // }
    barnesHut: {
      springLength: 800,
      gravitationalConstant: -2000,
    }
  },
    layout: {
      randomSeed: 42,
  }
};
// Props interface
interface GraphViewProps {
  tokenNodes: Array<{ id: string; label: string; symbol?: string }>;
  poolEdges: Array<{ id: string; from: string; to: string; protocol: string; width?: number; color?: string }>;
}

// Class to manage the network and position cache
class GraphManager {
  private network: Network | null = null;
  private nodesDataset: DataSet<any> | null = null;
  private edgesDataset: DataSet<any> | null = null;
  private initialized = false;
  private container: HTMLElement | null = null;
  private popupDiv: HTMLElement | null = null;
  private activeTimeout: NodeJS.Timeout | null = null;
  private selectedNodeId: string | null = null; // To track selected node
  private boundHandleDocumentMousedown: ((event: MouseEvent) => void) | null = null;

  initialize(container: HTMLElement, initialNodes: any[], initialEdges: any[]) {
    console.log('DEBUG: GraphManager.initialize', initialNodes.length, initialEdges.length);
    this.boundHandleDocumentMousedown = this.handleDocumentMousedown.bind(this);
    this.container = container;

    // Create datasets
    this.nodesDataset = new DataSet(initialNodes);
    this.edgesDataset = new DataSet(initialEdges);

    // Node labels are assumed to be set correctly (just symbol) by useGraphData
    // No need for the address formatting loop here if useGraphData provides final labels.
    // const nodes = this.nodesDataset.get();
    // nodes.forEach(node => { ... });

    // Create network
    this.network = new Network(
      container,
      { nodes: this.nodesDataset, edges: this.edgesDataset },
      networkOptions
    );

    // Add click event handler for nodes
    this.network.on('click', (params) => {
      const clickedNodeId = params.nodes.length > 0 ? params.nodes[0] : null;
      const previousSelectedNodeId = this.selectedNodeId;
      const clickEvent = params.event?.center || { x: 0, y: 0 };

      if (clickedNodeId) {
        // A node was clicked
        if (clickedNodeId === previousSelectedNodeId) {
          // Clicked on the SAME already selected node.
          // Re-show/re-position the tooltip. showTokenInfo handles hide/show and doc listener.
          const tokenData = this.getTokenData(clickedNodeId);
          this.showTokenInfo(clickedNodeId, tokenData, clickEvent);
        } else {
          // Clicked on a NEW (different) node.
          this.hidePopup(); // Hide any existing popup (and removes doc listener)

          // Revert style of the previously selected node (if any)
          if (previousSelectedNodeId) {
            this.nodesDataset?.update({
              id: previousSelectedNodeId,
              borderWidth: networkOptions.nodes.borderWidth,
              color: {
                border: networkOptions.nodes.color.border,
                background: networkOptions.nodes.color.background,
                highlight: networkOptions.nodes.color.highlight
              }
            });
          }

          // Apply selected style to the new node.
          this.nodesDataset?.update({
            id: clickedNodeId,
            borderWidth: 2,
            color: {
              border: '#FF3366',
              background: networkOptions.nodes.color.background,
              highlight: {
                border: '#FF3366',
                background: networkOptions.nodes.color.highlight.background
              }
            }
          });
          this.selectedNodeId = clickedNodeId;

          // Show tooltip for the new node.
          // Using setTimeout for consistent behavior.
          setTimeout(() => {
            if (this.selectedNodeId === clickedNodeId) {
              const tokenData = this.getTokenData(clickedNodeId);
              this.showTokenInfo(clickedNodeId, tokenData, clickEvent); // This will add the doc listener
            }
          }, 50);
        }
      } else {
        // Clicked on CANVAS (not a node).
        this.hidePopup(); // Hide any existing popup (and removes doc listener)

        // Deselect any currently selected node
        if (previousSelectedNodeId) {
          this.nodesDataset?.update({
            id: previousSelectedNodeId,
            borderWidth: networkOptions.nodes.borderWidth,
            color: {
              border: networkOptions.nodes.color.border,
              background: networkOptions.nodes.color.background,
              highlight: networkOptions.nodes.color.highlight
            }
          });
        }
        this.selectedNodeId = null; // No node is selected.
      }
    });

    // Add zoom handler to hide popup when zooming
    this.network.on('zoom', () => {
      this.hidePopup();
    });

    // Add drag handler to hide popup when dragging
    this.network.on('dragStart', () => {
      this.hidePopup();
    });


    this.initialized = true;
  }

  getTokenData(nodeId: string) {
    if (!this.edgesDataset) return { poolCount: 0, address: nodeId };

    // Count pools for this token
    const connectedPools = this.edgesDataset.get({
      filter: (edge: any) => edge.from === nodeId || edge.to === nodeId
    });

    return {
      poolCount: connectedPools.length,
      address: nodeId
    };
  }

  showPopup(nodeId: string, content: string, options: { position: { x: number, y: number }, direction: string }) {
    if (!this.network || !this.container) return;

    // Clean up any existing popup
    this.hidePopup();

    // Create popup div if it doesn't exist yet
    if (!this.popupDiv) {
      this.popupDiv = document.createElement('div');
      this.popupDiv.style.position = 'fixed'; // Use fixed positioning for better stability
      this.popupDiv.style.zIndex = '1000';
      this.popupDiv.style.pointerEvents = 'auto';
      document.body.appendChild(this.popupDiv); // Attach to body for best positioning
    }

    // Add content to popup
    this.popupDiv.innerHTML = content;

    // Display the popup so we can calculate its height
    this.popupDiv.style.display = 'block';

    // Position the popup centered horizontally and above the node
    const popupHeight = this.popupDiv.offsetHeight;
    const popupWidth = this.popupDiv.offsetWidth;

    // Get the client position from the click event
    const clickX = options.position.x;
    const clickY = options.position.y;

    // Position popup directly above the click position
    this.popupDiv.style.left = `${clickX - (popupWidth / 2)}px`;
    this.popupDiv.style.top = `${clickY - popupHeight - 20}px`;

    // Add document mousedown listener only when popup is shown
    if (this.boundHandleDocumentMousedown) {
      document.addEventListener('mousedown', this.boundHandleDocumentMousedown, true); // Use capture phase
    }
  }

  private handleDocumentMousedown(event: MouseEvent) {
    if (this.popupDiv && !this.popupDiv.contains(event.target as Node)) {
      // Clicked outside the popup
      this.hidePopup();
      if (this.selectedNodeId) {
        // Revert previously selected node to default styling
        this.nodesDataset?.update({
          id: this.selectedNodeId,
          borderWidth: networkOptions.nodes.borderWidth,
          color: {
            border: networkOptions.nodes.color.border,
            background: networkOptions.nodes.color.background,
            highlight: networkOptions.nodes.color.highlight
          }
        });
        this.selectedNodeId = null;
      }
    }
  }

  hidePopup() {
    if (this.activeTimeout) {
      clearTimeout(this.activeTimeout);
      this.activeTimeout = null;
    }

    if (this.popupDiv) {
      // Remove the popup from the DOM entirely
      if (this.popupDiv.parentNode) {
        this.popupDiv.parentNode.removeChild(this.popupDiv);
      }
      this.popupDiv = null;
      // Remove document mousedown listener when popup is hidden
      if (this.boundHandleDocumentMousedown) {
        document.removeEventListener('mousedown', this.boundHandleDocumentMousedown, true);
      }
    }
  }

  showTokenInfo(nodeId: string, data: { poolCount: number, address: string }, clickEvent?: { x: number, y: number }) {
    if (!this.network) return;

    // Clear any existing timeout
    if (this.activeTimeout) {
      clearTimeout(this.activeTimeout);
      this.activeTimeout = null;
    }

    // Format address for display
    const address = data.address || '';
    const firstByte = address.slice(0, 2) === '0x' ? address.slice(2, 6) : address.slice(0, 4);
    const lastByte = address.slice(-4);
    const shortAddress = address && firstByte && lastByte
      ? `0x${firstByte}...${lastByte}`
      : address;

    // Get node data
    const node = this.nodesDataset?.get(nodeId);

    // Create HTML content for popup
    // Applying styles based on Figma's tooltip (7903:5709)
    const content = `
      <div style="
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        padding: 16px; 
        background-color: rgba(255, 244, 224, 0.04); 
        color: #FFF4E0; 
        border-radius: 8px; 
        border: 1px solid rgba(255, 244, 224, 0.2); 
        box-shadow: 0px 4px 16px 0px rgba(37, 0, 63, 0.2);
        backdrop-filter: blur(10.4px);
        -webkit-backdrop-filter: blur(10.4px);
        min-width: 200px; /* Ensure a reasonable minimum width */
      ">        
        <div style="margin-bottom: 8px;">
          <span style="color: rgba(255, 244, 224, 0.64);">Pools: </span>
          <span style="color: #FFF4E0;">${data.poolCount}</span>
        </div>
        
        <div>
          <span style="color: rgba(255, 244, 224, 0.64);">Address: </span>
          <a href="https://etherscan.io/token/${data.address}" 
             target="_blank" 
             rel="noopener noreferrer"
             style="color: rgba(255, 244, 224, 0.64); text-decoration: underline; word-break: break-all;">${shortAddress}</a>
        </div>
      </div>
    `;

    // Show popup above the node
    this.showPopup(nodeId, content, {
      position: clickEvent || { x: 0, y: 0 },
      direction: 'center'
    });
  }

  updateData(nodes: any[], edges: any[]) {
    // Keep physics disabled, just update properties
    this.nodesDataset.update(nodes);
    this.edgesDataset.update(edges);
  }

  destroy() {
    console.log('DEBUG: GraphManager.destroy');

    // Clean up popup
    this.hidePopup(); // This will also remove the document listener if active
    // No need to explicitly remove this.popupDiv from container, hidePopup handles it.

    if (this.network) {
      this.network.destroy();
      this.network = null;
    }
    this.nodesDataset = null;
    this.edgesDataset = null;
    this.initialized = false;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

// Main component
const GraphView: React.FC<GraphViewProps> = ({ tokenNodes, poolEdges }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphManagerRef = useRef<GraphManager | null>(null);

  // Initialize graph only once
  useEffect(() => {
    if (!graphManagerRef.current) {
      graphManagerRef.current = new GraphManager();
    }

    if (containerRef.current) {
      const manager = graphManagerRef.current;
      if (!manager.isInitialized() && tokenNodes.length > 0 && poolEdges.length > 0) {
        manager.initialize(containerRef.current, tokenNodes, poolEdges);
      }
    }

    // Only clean up on unmount
    return () => {
      if (graphManagerRef.current) {
        graphManagerRef.current.destroy();
        graphManagerRef.current = null;
      }
    };
  }, []); // Empty dependency array = only run on mount/unmount

  // Handle data updates separately
  useEffect(() => {
    if (containerRef.current && tokenNodes.length > 0 && poolEdges.length > 0) {
      const manager = graphManagerRef.current;
      if (manager) {
        if (!manager.isInitialized()) {
          manager.initialize(containerRef.current, tokenNodes, poolEdges);
        } else {
          manager.updateData(tokenNodes, poolEdges);
        }
      }
    }
  }, [tokenNodes, poolEdges]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />; {/* Removed border */ }
};

export default GraphView;
