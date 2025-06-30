import React, { useRef, useState, useEffect } from 'react';
import { NetworkManager } from '@/components/dexscan/graph/network/NetworkManager';
import { NodeTooltip } from '@/components/dexscan/graph/tooltips/NodeTooltip';
import { EdgeTooltip } from '@/components/dexscan/graph/tooltips/EdgeTooltip';
import { testNodes, testEdges, newNode, newEdge } from '@/components/dexscan/graph/test/testNetworkData';
import { mockPools, edgePoolMap } from '@/components/dexscan/graph/test/mockPoolData';
import { getNodeData, getConnectionData, getPoolData } from '@/components/dexscan/graph/test/testHelpers';

/**
 * Test component for NetworkManager
 */
export const NetworkManagerTest = () => {
  const containerRef = useRef(null);
  const networkManagerRef = useRef(null);
  const [status, setStatus] = useState('Not initialized');
  const [error, setError] = useState(null);
  const [nodes, setNodes] = useState([...testNodes]);
  const [edges, setEdges] = useState([...testEdges]);
  
  // Tooltip state
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleInitialize = () => {
    if (!containerRef.current) {
      setError('Container not ready');
      return;
    }

    try {
      if (!networkManagerRef.current) {
        networkManagerRef.current = new NetworkManager();
      }

      // Use default options, but disable physics for testing
      networkManagerRef.current.initialize(
        containerRef.current,
        nodes,
        edges,
        { physics: { enabled: false } }
      );

      setStatus('Initialized successfully');
      setError(null);
      console.log('NetworkManager initialized', networkManagerRef.current);
      
      // Setup click handlers for tooltips
      const network = networkManagerRef.current.getNetwork();
      network.on('click', (params) => {
        if (params.nodes.length > 0) {
          setSelectedNode(params.nodes[0]);
          setSelectedEdge(null);
          setTooltipPosition({ x: params.pointer.DOM.x, y: params.pointer.DOM.y });
        } else if (params.edges.length > 0) {
          setSelectedNode(null);
          setSelectedEdge(params.edges[0]);
          setTooltipPosition({ x: params.pointer.DOM.x, y: params.pointer.DOM.y });
        } else {
          setSelectedNode(null);
          setSelectedEdge(null);
        }
      });
    } catch (err) {
      setStatus('Initialization failed');
      setError(err.message);
    }
  };

  const handleAddNode = () => {
    if (!networkManagerRef.current?.getNetwork()) {
      setError('Network not initialized');
      return;
    }

    try {
      const updatedNodes = [...nodes, newNode];
      const updatedEdges = [...edges, newEdge];
      
      networkManagerRef.current.updateData(updatedNodes, updatedEdges);
      
      setNodes(updatedNodes);
      setEdges(updatedEdges);
      setStatus('Added new node and edge');
      setError(null);
    } catch (err) {
      setError('Failed to add node: ' + err.message);
    }
  };

  const handleRemoveNode = () => {
    if (!networkManagerRef.current?.getNetwork()) {
      setError('Network not initialized');
      return;
    }

    try {
      const updatedNodes = nodes.filter(n => n.id !== '0x3');
      const updatedEdges = edges.filter(e => e.from !== '0x3' && e.to !== '0x3');
      
      networkManagerRef.current.updateData(updatedNodes, updatedEdges);
      
      setNodes(updatedNodes);
      setEdges(updatedEdges);
      setStatus('Removed DAI node');
      setError(null);
    } catch (err) {
      setError('Failed to remove node: ' + err.message);
    }
  };

  const handleUpdateEdges = () => {
    if (!networkManagerRef.current?.getNetwork()) {
      setError('Network not initialized');
      return;
    }

    try {
      const updatedEdges = edges.map(e => ({
        ...e,
        color: e.color === '#FF3366' ? '#00FF00' : e.color,
        width: e.width === 2 ? 5 : e.width
      }));
      
      networkManagerRef.current.updateData(nodes, updatedEdges);
      
      setEdges(updatedEdges);
      setStatus('Updated edge colors and widths');
      setError(null);
    } catch (err) {
      setError('Failed to update edges: ' + err.message);
    }
  };

  const handleDestroy = () => {
    if (networkManagerRef.current) {
      networkManagerRef.current.destroy();
      setStatus('Network destroyed');
      setError(null);
      setNodes([...testNodes]);
      setEdges([...testEdges]);
    }
  };

  return (
    <div className="p-4 h-screen flex flex-col bg-dark-charcoal">
      <h1 className="text-2xl font-bold mb-4 text-milk-base">NetworkManager Test</h1>
      
      <div className="mb-4 flex gap-2">
        <button 
          onClick={handleInitialize}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Initialize Network
        </button>
        <button 
          onClick={handleAddNode}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add WBTC Node
        </button>
        <button 
          onClick={handleRemoveNode}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Remove DAI Node
        </button>
        <button 
          onClick={handleUpdateEdges}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Update Edges
        </button>
        <button 
          onClick={handleDestroy}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Destroy Network
        </button>
      </div>

      <div className="mb-4 text-milk-base">
        <div>Status: <span className="font-mono">{status}</span></div>
        {error && <div className="text-red-500">Error: {error}</div>}
        <div className="text-sm text-gray-400">
          Nodes: {nodes.length}, Edges: {edges.length}
        </div>
      </div>

      <div 
        ref={containerRef} 
        className="flex-1 border-2 border-gray-600 rounded bg-gray-900"
        style={{ minHeight: '400px' }}
      />
      
      {/* Tooltips */}
      {selectedNode && (
        <div style={{ position: 'fixed', left: tooltipPosition.x, top: tooltipPosition.y - 20, zIndex: 1000 }}>
          <NodeTooltip
            nodeData={getNodeData(selectedNode)}
            connectionData={getConnectionData(selectedNode, edges)}
            selectedChain="ethereum"
          />
        </div>
      )}
      
      {selectedEdge && (
        <div style={{ position: 'fixed', left: tooltipPosition.x, top: tooltipPosition.y - 20, zIndex: 1000 }}>
          <EdgeTooltip
            pool={getPoolData(selectedEdge)}
            selectedChain="ethereum"
          />
        </div>
      )}
    </div>
  );
};