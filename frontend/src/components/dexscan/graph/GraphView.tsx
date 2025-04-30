import React, { useEffect, useRef } from 'react';
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

const GraphView: React.FC<GraphViewProps> = ({ tokenNodes, poolEdges }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clean up previous network instance if it exists
    if (networkRef.current) {
      networkRef.current.destroy();
      networkRef.current = null;
    }
    
    // Only create network if we have data to display
    if (tokenNodes.length > 0 && poolEdges.length > 0) {
      // Create datasets
      const nodes = new DataSet(tokenNodes);
      const edges = new DataSet(poolEdges);
      
      // Initialize network
      const network = new Network(
        containerRef.current,
        { nodes, edges },
        networkOptions
      );
      
      // Store network reference
      networkRef.current = network;
    }
    
    return () => { 
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [tokenNodes, poolEdges]);
  
  return <div ref={containerRef} style={{ height: "700px", width: "100%", border: "1px solid transparent" }} />;
};

export default GraphView;