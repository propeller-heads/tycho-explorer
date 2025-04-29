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
  poolEdges: Array<{id: string; from: string; to: string; protocol: string; width?: number}>;
  protocolColorMap: Record<string, {color: string}>;
}

const GraphView: React.FC<GraphViewProps> = ({ tokenNodes, poolEdges, protocolColorMap }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create datasets
    const nodes = new DataSet(tokenNodes);
    const edges = new DataSet(poolEdges.map(edge => ({
      ...edge,
      color: protocolColorMap[edge.protocol]?.color || '#aaaaaa'
    })));
    
    // Initialize network
    const network = new Network(
      containerRef.current,
      { nodes, edges },
      networkOptions
    );
    
    // // Stabilize the network first
    // network.once('stabilizationIterationsDone', () => {
    //   // Find important nodes (like WETH) and fix their position
    //   tokenNodes.forEach(node => {
    //     if (node.label === 'WETH' || node.label === 'ETH' || node.label === 'USDC' || node.label === 'USDT') {
    //       // Fix position of key nodes after initial stabilization
    //       network.body.data.nodes.update({
    //         id: node.id,
    //         fixed: { x: true, y: true }
    //       });
    //     }
    //   });
      
    //   // Fine-tune physics once the network is stable
    //   network.setOptions({
    //     physics: {
    //       stabilization: false, // Disable further stabilization
    //       minVelocity: 0.5 // Lower velocity threshold for stability
    //     }
    //   });
    // });
    
    return () => { network.destroy(); };
  }, [tokenNodes, poolEdges, protocolColorMap]);
  
  return <div ref={containerRef} style={{ height: "1000px", width: "100%", border: "1px solid white" }} />;
};

export default GraphView;