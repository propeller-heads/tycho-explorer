import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';

const TestGraph = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Simple test data
    const nodes = new DataSet([
      { id: 1, label: "Node 1" },
      { id: 2, label: "Node 2" },
      { id: 3, label: "Node 3" }
    ]);
    
    const edges = new DataSet([
      { id: "e1", from: 1, to: 2 },
      { id: "e2", from: 2, to: 3 }
    ]);
    
    // Create network
    try {
      const network = new Network(
        containerRef.current,
        { nodes, edges },
        {}
      );
      console.log("Network created successfully:", network);
    } catch (error) {
      console.error("Error creating network:", error);
    }
  }, []);
  
  return (
    <div className="border-2 border-red-500">
      <h2>Test Graph</h2>
      <div 
        ref={containerRef} 
        style={{ height: "400px", width: "100%" }}
      ></div>
    </div>
  );
};

export default TestGraph;