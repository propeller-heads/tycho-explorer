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
    margin: 10, // Margin around text
    fixed: {
      // Fix key nodes like WETH in place to prevent rattling
      // Will be applied to specific nodes in the useEffect
    },
    // Add tooltip settings
    chosen: {
      node: function(values, id, selected, hovering) {
        values.borderWidth = 2;
        values.borderColor = "#F66733";
      }
    }
  },
  physics: {
    enabled: true,
    barnesHut: { 
      springLength: 150, 
      gravitationalConstant: -1500, // Reduced gravitational force
      damping: 0.95, // Increased damping to reduce oscillation
      centralGravity: 0.3 // Increased central gravity
    },
    stabilization: {
      enabled: true,
      iterations: 2000, // More iterations for better stabilization
      fit: true,
      updateInterval: 50
    },
    timestep: 0.3, // Slower timestep for more stability
    adaptiveTimestep: true,
    minVelocity: 0.75 // System considered stable once nodes move slower than this
  },
  layout: {
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
  private positions: Record<string, {x: number, y: number}> = {};
  private initialized = false;
  private container: HTMLElement | null = null;
  private onStabilized: (() => void) | null = null;
  private popupDiv: HTMLElement | null = null;
  private activeTimeout: NodeJS.Timeout | null = null;
  
  initialize(container: HTMLElement, initialNodes: any[], initialEdges: any[], callback?: () => void) {
    console.log('DEBUG: GraphManager.initialize', initialNodes.length, initialEdges.length);
    this.container = container;
    this.onStabilized = callback || null;
    
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
    
    // Save positions when stabilized
    this.network.once('stabilized', () => {
      console.log('DEBUG: Network stabilized, saving positions');
      this.savePositions();
      this.disablePhysics();
      if (this.onStabilized) this.onStabilized();
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
  
  updateData(nodes: any[], edges: any[], structureChanged: boolean) {
    console.log('DEBUG: GraphManager.updateData', nodes.length, edges.length, 'structure changed:', structureChanged);
    
    if (!this.initialized || !this.nodesDataset || !this.edgesDataset) {
      console.error('DEBUG: Cannot update, graph not initialized');
      return;
    }
    
    if (structureChanged) {
      console.log('DEBUG: Structure changed, enabling physics and recreating datasets');
      this.enablePhysics();
      
      // Clear and update datasets
      this.nodesDataset.clear();
      this.nodesDataset.add(nodes);
      
      this.edgesDataset.clear();
      this.edgesDataset.add(edges);
      
      // Network will stabilize again with new structure
      if (this.network) {
        this.network.once('stabilized', () => {
          console.log('DEBUG: Network re-stabilized after structure change');
          this.savePositions();
          this.disablePhysics();
        });
      }
    } else {
      console.log('DEBUG: Structure unchanged, updating properties without physics');
      
      // Keep physics disabled, just update properties
      this.nodesDataset.update(nodes);
      this.edgesDataset.update(edges);
      
      // Apply saved positions
      this.restorePositions();
    }
  }
  
  savePositions() {
    if (!this.network) return;
    console.log('DEBUG: Saving node positions');
    this.positions = this.network.getPositions();
  }
  
  restorePositions() {
    if (!this.network || !this.nodesDataset) return;
    console.log('DEBUG: Restoring node positions');
    
    // Get current node IDs
    const nodeIds = this.nodesDataset.getIds();
    
    // Only restore positions for nodes that exist
    nodeIds.forEach(id => {
      if (this.positions[id] && this.network) {
        this.network.moveNode(id, this.positions[id].x, this.positions[id].y);
      }
    });
  }
  
  enablePhysics() {
    if (!this.network) return;
    console.log('DEBUG: Enabling physics');
    this.network.setOptions({ physics: { ...networkOptions.physics, enabled: true } });
  }
  
  disablePhysics() {
    if (!this.network) return;
    console.log('DEBUG: Disabling physics');
    this.network.setOptions({ physics: { enabled: false } });
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
  const renderCountRef = useRef(0);
  const prevNodesRef = useRef<string[]>([]);
  const prevEdgesRef = useRef<string[]>([]);
  const [graphReady, setGraphReady] = useState(false);
  
  // Log props changes
  console.log(`DEBUG: GraphView render #${++renderCountRef.current}`, 
              `Nodes: ${tokenNodes.length}`, 
              `Edges: ${poolEdges.length}`);
  
  // Calculate structure change by comparing node and edge IDs
  const structureChanged = useCallback(() => {
    const currentNodeIds = tokenNodes.map(n => n.id).sort().join(',');
    const currentEdgeIds = poolEdges.map(e => e.id).sort().join(',');
    
    const nodesChanged = currentNodeIds !== prevNodesRef.current.join(',');
    const edgesChanged = currentEdgeIds !== prevEdgesRef.current.join(',');
    
    // Update refs for next comparison
    prevNodesRef.current = tokenNodes.map(n => n.id);
    prevEdgesRef.current = poolEdges.map(e => e.id);
    
    const changed = nodesChanged || edgesChanged;
    console.log('DEBUG: Structure changed?', changed, 'Nodes:', nodesChanged, 'Edges:', edgesChanged);
    return changed;
  }, [tokenNodes, poolEdges]);
  
  useEffect(() => {
    // Create GraphManager if it doesn't exist
    if (!graphManagerRef.current) {
      console.log('DEBUG: Creating new GraphManager');
      graphManagerRef.current = new GraphManager();
    }
    
    // If we have a container and data, initialize
    if (containerRef.current && tokenNodes.length > 0 && poolEdges.length > 0) {
      const manager = graphManagerRef.current;
      
      if (!manager.isInitialized()) {
        console.log('DEBUG: Initializing graph');
        manager.initialize(containerRef.current, tokenNodes, poolEdges, () => {
          setGraphReady(true);
        });
      } else {
        console.log('DEBUG: Updating existing graph');
        manager.updateData(tokenNodes, poolEdges, structureChanged());
      }
    }
    
    return () => {
      if (graphManagerRef.current) {
        console.log('DEBUG: Cleaning up GraphManager');
        graphManagerRef.current.destroy();
        graphManagerRef.current = null;
      }
    };
  }, [tokenNodes, poolEdges, structureChanged]);
  
  return <div ref={containerRef} style={{ height: "100%", width: "100%", border: "1px solid transparent" }} />;
};

export default GraphView;