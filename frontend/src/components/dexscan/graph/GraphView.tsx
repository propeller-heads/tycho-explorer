import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';

// Define the network options
const networkOptions = {
  nodes: {
    shape: "box", // Box shape to fit the token labels
    color: {
      border: "#ffffff",
      background: "#232323",
      highlight: { border: "#000000", background: "#F66733" }
    },
    borderWidth: 1,
    font: { size: 12, color: "#ffffff" },
    widthConstraint: {
      maximum: 120 // Width constraint for labels
    },
    heightConstraint: {
      minimum: 30, // Min height for nodes
      valign: "middle"
    },
    margin: { top: 10, right: 10, bottom: 10, left: 10 },
    fixed: {
      // Fix key nodes like WETH in place to prevent rattling
      // Will be applied to specific nodes in the useEffect
    },
    chosen: {
      node: true,
      label: true
    }
  },
  physics: {
    barnesHut: {
      springLength: 800,
      gravitationalConstant: -2000,
    },
    solver: "repulsion",
    repulsion: {
      nodeDistance: 600 // Put more distance between the nodes.
    }
  },
  layout: {
    randomSeed: 42,
    improvedLayout: false
  }
};

// Props interface
interface GraphViewProps {
  tokenNodes: Array<{id: string; label: string; symbol?: string}>;
  poolEdges: Array<{id: string; from: string; to: string; protocol: string; width?: number; color?: string}>;
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
  
  initialize(container: HTMLElement, initialNodes: any[], initialEdges: any[]) {
    console.log('DEBUG: GraphManager.initialize', initialNodes.length, initialEdges.length);
    this.container = container;
    
    // Create datasets
    this.nodesDataset = new DataSet(initialNodes);
    this.edgesDataset = new DataSet(initialEdges);
    
    // Format node labels to include address before creating network
    const nodes = this.nodesDataset.get();
    nodes.forEach(node => {
      // Add address format to label
      if (node.id && node.symbol) {
        const address = node.id.toString();
        const firstByte = address.slice(0, 2) === '0x' ? address.slice(2, 4) : address.slice(0, 2);
        const lastByte = address.slice(-2);
        
        // Update the label to include the address format
        node.label = `${node.symbol}${firstByte && lastByte ? ` (0x${firstByte}..${lastByte})` : ''}`;
        this.nodesDataset.update(node);
      }
    });
    
    // Create network
    this.network = new Network(
      container,
      { nodes: this.nodesDataset, edges: this.edgesDataset },
      networkOptions
    );
    
    // Add click event handler for nodes
    this.network.on('click', (params) => {
      // Always hide existing popup first
      this.hidePopup();
      
      if (params.nodes.length > 0) {
        // Store the click event for later use
        const clickEvent = params.event?.center || { x: 0, y: 0 };
        
        // Clicked on a node - show popup with small delay to ensure accurate positioning
        setTimeout(() => {
          const nodeId = params.nodes[0];
          const tokenData = this.getTokenData(nodeId);
          this.showTokenInfo(nodeId, tokenData, clickEvent);
        }, 50);
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
  
  showPopup(nodeId: string, content: string, options: {position: {x: number, y: number}, direction: string}) {
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
    }
  }
  
  showTokenInfo(nodeId: string, data: {poolCount: number, address: string}, clickEvent?: {x: number, y: number}) {
    if (!this.network) return;
    
    // Clear any existing timeout
    if (this.activeTimeout) {
      clearTimeout(this.activeTimeout);
      this.activeTimeout = null;
    }
    
    // Format address for display
    const address = data.address || '';
    const firstByte = address.slice(0, 2) === '0x' ? address.slice(2, 4) : address.slice(0, 2);
    const lastByte = address.slice(-2);
    const shortAddress = address && firstByte && lastByte 
      ? `0x${firstByte}..${lastByte}`
      : address;
    
    // Get node data
    const node = this.nodesDataset?.get(nodeId);
    const tokenSymbol = node?.symbol || ''; // Use symbol for token name
    
    // Create HTML content for popup
    const content = `
      <div style="padding: 10px; background-color: rgba(35, 35, 35, 0.9); color: white; border-radius: 4px; border: 1px solid #444; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">
        <div style="font-weight: bold; margin-bottom: 8px;">Token Info</div>
        <div style="margin-bottom: 6px;">Symbol: ${tokenSymbol}</div>
        <div style="margin-bottom: 6px;">Pools: ${data.poolCount}</div>
        <div>
          Address: <a href="https://etherscan.io/token/${data.address}" 
                     target="_blank" 
                     style="color: #69a1ff; text-decoration: underline;"
                     rel="noopener noreferrer">${shortAddress}</a>
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
    this.hidePopup();
    if (this.popupDiv && this.container) {
      this.container.removeChild(this.popupDiv);
      this.popupDiv = null;
    }
    
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
  
  return <div ref={containerRef} style={{ height: "100%", width: "100%", border: "2px solid black" }} />;
};

export default GraphView;