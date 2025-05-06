import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';

// Define the network options
const networkOptions = {
  nodes: {
    shape: "circle",
    color: {
      border: "#ffffff",
      background: "#232323",
      highlight: { border: "#000000", background: "#F66733" }
    },
    borderWidth: 1,
    font: { size: 10, color: "#ffffff" },
    fixed: {
      // Fix key nodes like WETH in place to prevent rattling
      // Will be applied to specific nodes in the useEffect
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
  tokenNodes: Array<{id: string; label: string}>;
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
  
  initialize(container: HTMLElement, initialNodes: any[], initialEdges: any[], callback?: () => void) {
    console.log('DEBUG: GraphManager.initialize', initialNodes.length, initialEdges.length);
    this.container = container;
    this.onStabilized = callback || null;
    
    // Create datasets
    this.nodesDataset = new DataSet(initialNodes);
    this.edgesDataset = new DataSet(initialEdges);
    
    // Create network
    this.network = new Network(
      container,
      { nodes: this.nodesDataset, edges: this.edgesDataset },
      networkOptions
    );
    
    // Save positions when stabilized
    this.network.once('stabilized', () => {
      console.log('DEBUG: Network stabilized, saving positions');
      this.savePositions();
      this.disablePhysics();
      if (this.onStabilized) this.onStabilized();
    });
    
    this.initialized = true;
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