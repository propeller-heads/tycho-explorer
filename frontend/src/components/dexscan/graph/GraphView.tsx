import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';

// Define the network options
const networkOptions = {
  autoResize: true,
  nodes: {
    shape: "circle",
    size: 25, // Adjust based on visual preference and if icons/images are used
    color: {
      border: "rgba(255, 244, 224, 0.2)", // Subtle light border
      background: "rgba(10, 10, 20, 0.8)", // Very dark background
      highlight: {
        border: "#FF3366", // Folly Red for selection, as per activeContext
        background: "rgba(30, 30, 40, 0.9)",
      },
      hover: {
        border: "rgba(255, 244, 224, 0.5)",
        background: "rgba(30, 30, 40, 0.9)",
      }
    },
    borderWidth: 1,
    // borderWidthSelected is handled programmatically in GraphManager for #FF3366
    font: {
      size: 11,
      color: "#FFF4E0", // Light cream/off-white for text on dark nodes
      face: "Inter, Arial, sans-serif",
      vadjust: 0, // Adjust if text isn't centered well
    },
    // mass: 1, // Default
    physics: true, // Default
  },
  edges: {
    width: 1,
    color: {
      color: "rgba(255, 244, 224, 0.15)", // Very subtle default edge
      highlight: "rgba(255, 244, 224, 0.4)",
      hover: "rgba(255, 244, 224, 0.4)",
      inherit: false, // Assuming dynamic coloring for protocols etc.
    },
    smooth: {
      enabled: true,
      type: "continuous", // For straighter default lines; parallel curves handled elsewhere
      roundness: 0.05     // Very slight curve, almost straight
    },
    // physics: true, // Default
  },
  physics: {
    enabled: true,
    solver: 'barnesHut', // Default, generally good for non-hierarchical
    barnesHut: {
      gravitationalConstant: -25000, // Increased repulsion
      centralGravity: 0.1,           // Reduced pull to center
      springLength: 300,             // Increased for more node separation
      springConstant: 0.03,          // Might need slight reduction with longer springs
      damping: 0.09,                 // Standard
      avoidOverlap: 0.7              // Increased to prevent node overlap
    },
    adaptiveTimestep: true, // Default
    // Stabilization options:
    // fit: false is crucial to prevent the graph from resetting user's zoom/pan
    // on data updates (e.g., new block). Vis-network defaults fit to true,
    // which causes the view to re-center and re-zoom to fit all nodes.
    stabilization: { 
      enabled: true, // Or false if you don't want initial stabilization iterations
      iterations: 1000, // Default, adjust if needed
      fit: false,       // Prevents auto-fitting the graph on data changes / initial load
      // updateInterval: 50, // Default
      // iterationsPerUpdate: 10 // Default
    }
  },
  layout: {
    randomSeed: 42, // Or a specific seed once a good layout is found
    hierarchical: {
      enabled: false // TC Design is not hierarchical
    },
    // improvedLayout: true, // Default
  },
  interaction: {
    hover: true, // To see hover effects
    tooltipDelay: 200, // Default 300
    // Other interaction defaults are usually fine
  }
};


// Minimal types for rawPoolsData, assuming structure from PoolDataContext/useGraphData
interface RawToken {
  address: string;
}

interface RawPool {
  id: string;
  tokens: RawToken[];
  // Other pool properties are not needed for pool count logic here
}

// Props interface
interface GraphViewProps {
  tokenNodes: Array<{ id: string; label: string; symbol?: string }>;
  poolEdges: Array<{ id: string; from: string; to: string; protocol: string; width?: number; color?: string }>;
  rawPoolsData: Record<string, RawPool>; // Optional for now, to avoid breaking if not passed immediately
}

// Class to manage the network and position cache
class GraphManager {
  private network: Network | null = null;
  private nodesDataset: DataSet<any> | null = null;
  private edgesDataset: DataSet<any> | null = null;
  public rawPoolsData: Record<string, RawPool>
  private initialized = false;
  private container: HTMLElement | null = null;
  private popupDiv: HTMLElement | null = null;
  private activeTimeout: NodeJS.Timeout | null = null;
  private selectedNodeId: string | null = null; // To track selected node
  private boundHandleDocumentMousedown: ((event: MouseEvent) => void) | null = null;

  initialize(container: HTMLElement, initialNodes: any[], initialEdges: any[], rawPools: Record<string, RawPool>) {
    this.rawPoolsData = rawPools; // Store raw pools data
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
    // Use rawPoolsData to count pools
    if (!this.rawPoolsData) return { poolCount: 0, address: nodeId };

    let poolCount = 0;
    for (const poolId in this.rawPoolsData) {
      const pool = this.rawPoolsData[poolId];
      if (pool.tokens.some(token => token.address === nodeId)) {
        poolCount++;
      }
    }

    return {
      poolCount: poolCount,
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
          <span id="tooltip-pool-count" style="color: #FFF4E0;">${data.poolCount}</span>
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
    if (!this.nodesDataset || !this.edgesDataset) return;

    this.network.setData({nodes, edges});
  }

  refreshCurrentTooltipData() {
    if (this.popupDiv && this.selectedNodeId) {
      const poolCountSpan = this.popupDiv.querySelector('#tooltip-pool-count');
      if (poolCountSpan) {
        const freshTokenData = this.getTokenData(this.selectedNodeId);
        poolCountSpan.textContent = freshTokenData.poolCount.toString();
      }
    }
  }

  destroy() {
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
const GraphView: React.FC<GraphViewProps> = ({ tokenNodes, poolEdges, rawPoolsData }) => {
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
        manager.initialize(containerRef.current, tokenNodes, poolEdges, rawPoolsData);
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

  // Handle updates to nodes, edges, or rawPoolsData
  useEffect(() => {
    if (containerRef.current && graphManagerRef.current && graphManagerRef.current.isInitialized()) {
      const manager = graphManagerRef.current;
      // Pass rawPoolsData to updateData if it needs to be updated,
      // or ensure manager.rawPoolsData is updated if it changes.
      // For now, assuming rawPoolsData is primarily for initialization's getTokenData.
      manager.rawPoolsData = rawPoolsData; // Update manager's 
      manager.updateData(tokenNodes, poolEdges);
      manager.refreshCurrentTooltipData(); // Refresh tooltip if open
    }
  }, [tokenNodes, poolEdges, rawPoolsData]); // Add rawPoolsData to dependency array

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />; {/* Removed border */ }
};

export default GraphView;
