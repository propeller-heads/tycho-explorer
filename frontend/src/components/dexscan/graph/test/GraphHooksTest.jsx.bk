import React, { useState, useMemo } from 'react';
import { NetworkManager } from '@/components/dexscan/graph/network/NetworkManager';
import { NodeTooltip } from '@/components/dexscan/graph/tooltips/NodeTooltip';
import { EdgeTooltip } from '@/components/dexscan/graph/tooltips/EdgeTooltip';
import { usePoolFiltering } from '@/components/dexscan/graph/hooks/usePoolFiltering';
import { useNodeGeneration } from '@/components/dexscan/graph/hooks/useNodeGeneration';
import { useEdgeGeneration } from '@/components/dexscan/graph/hooks/useEdgeGeneration';
import { useParallelEdgeSmoothness } from '@/components/dexscan/graph/hooks/useParallelEdgeSmoothness';
import { useTokenLogos } from '@/components/dexscan/graph/hooks/useTokenLogos';
import { testPools } from '@/components/dexscan/graph/test/testPoolData';
import { getNodeData, getConnectionData, getPoolData } from '@/components/dexscan/graph/test/enhancedTestHelpers';

/**
 * Test component for graph hooks integration
 */
export const GraphHooksTest = () => {
  // Test state
  const [selectedTokens, setSelectedTokens] = useState(['0x1', '0x2']);
  const [selectedProtocols, setSelectedProtocols] = useState(['uniswap_v3']);
  const [currentBlock, setCurrentBlock] = useState(18500000);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Network visualization state
  const containerRef = React.useRef(null);
  const networkManagerRef = React.useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Helper to get absolute position for tooltip
  const getAbsolutePosition = (domPosition) => {
    if (!containerRef.current) return domPosition;
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: rect.left + domPosition.x,
      y: rect.top + domPosition.y
    };
  };
  
  // Test the hooks
  const filteredPools = usePoolFiltering(testPools, selectedTokens, selectedProtocols);
  const apiLogos = useTokenLogos(filteredPools);
  const nodes = useNodeGeneration(filteredPools, apiLogos);
  const edges = useEdgeGeneration(filteredPools, selectedProtocols, currentBlock);
  const smoothEdges = useParallelEdgeSmoothness(edges);
  
  // Available tokens and protocols from test data
  const availableTokens = useMemo(() => {
    const tokens = new Map();
    Object.values(testPools).forEach(pool => {
      pool.tokens.forEach(token => {
        tokens.set(token.address, token);
      });
    });
    return Array.from(tokens.values());
  }, []);
  
  const availableProtocols = useMemo(() => {
    return [...new Set(Object.values(testPools).map(p => p.protocol_system))];
  }, []);
  
  // Initialize network when nodes/edges change
  React.useEffect(() => {
    if (containerRef.current) {
      if (nodes.length > 0) {
        if (!networkManagerRef.current) {
          // First time initialization
          networkManagerRef.current = new NetworkManager();
          networkManagerRef.current.initialize(
            containerRef.current,
            nodes,
            smoothEdges,
          );
          
          // Setup click handlers only once
          const network = networkManagerRef.current.getNetwork();
          network.on('click', (params) => {
            console.log('Click event:', params);
            console.log('DOM coordinates:', params.pointer.DOM);
            console.log('Canvas coordinates:', params.pointer.canvas);
            
            if (params.nodes.length > 0) {
              console.log('Node clicked:', params.nodes[0]);
              setSelectedNode(params.nodes[0]);
              setSelectedEdge(null);
              const absPos = getAbsolutePosition(params.pointer.DOM);
              console.log('Absolute position:', absPos);
              setTooltipPosition(absPos);
            } else if (params.edges.length > 0) {
              console.log('Edge clicked:', params.edges[0]);
              setSelectedNode(null);
              setSelectedEdge(params.edges[0]);
              const absPos = getAbsolutePosition(params.pointer.DOM);
              console.log('Absolute position:', absPos);
              setTooltipPosition(absPos);
            } else {
              console.log('Empty click - clearing selection');
              setSelectedNode(null);
              setSelectedEdge(null);
            }
          });
        } else {
          // Update existing network
          networkManagerRef.current.updateData(nodes, smoothEdges);
        }
      } else {
        // No nodes - destroy the network if it exists
        if (networkManagerRef.current) {
          networkManagerRef.current.destroy();
          networkManagerRef.current = null;
          setSelectedNode(null);
          setSelectedEdge(null);
        }
      }
    }
  }, [nodes, smoothEdges]);
  
  const handleTokenToggle = (address) => {
    setSelectedTokens(prev => 
      prev.includes(address) 
        ? prev.filter(a => a !== address)
        : [...prev, address]
    );
  };
  
  const handleProtocolToggle = (protocol) => {
    setSelectedProtocols(prev => 
      prev.includes(protocol)
        ? prev.filter(p => p !== protocol)
        : [...prev, protocol]
    );
  };
  
  // Count parallel edges
  const parallelEdgeCount = useMemo(() => {
    const pairCounts = {};
    edges.forEach(edge => {
      const key = [edge.from, edge.to].sort().join('-');
      pairCounts[key] = (pairCounts[key] || 0) + 1;
    });
    return Object.values(pairCounts).filter(count => count > 1).length;
  }, [edges]);
  
  return (
    <div className="p-4 h-screen flex flex-col bg-dark-charcoal">
      <h1 className="text-2xl font-bold mb-4 text-milk-base">Graph Hooks Test</h1>
      
      {/* Tab Navigation */}
      <div className="mb-4 flex gap-2">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded ${activeTab === 'overview' ? 'bg-blue-600' : 'bg-gray-700'} text-white`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('hooks')}
          className={`px-4 py-2 rounded ${activeTab === 'hooks' ? 'bg-blue-600' : 'bg-gray-700'} text-white`}
        >
          Hook Details
        </button>
        <button 
          onClick={() => setActiveTab('data')}
          className={`px-4 py-2 rounded ${activeTab === 'data' ? 'bg-blue-600' : 'bg-gray-700'} text-white`}
        >
          Raw Data
        </button>
      </div>
      
      {/* Controls */}
      <div className="mb-4 bg-gray-800 p-4 rounded">
        <div className="mb-3">
          <h3 className="text-milk-base font-semibold mb-2">Selected Tokens:</h3>
          <div className="flex gap-2 flex-wrap">
            {availableTokens.map(token => (
              <label key={token.address} className="flex items-center gap-1 text-milk-base">
                <input 
                  type="checkbox"
                  checked={selectedTokens.includes(token.address)}
                  onChange={() => handleTokenToggle(token.address)}
                />
                {token.symbol}
              </label>
            ))}
          </div>
        </div>
        
        <div className="mb-3">
          <h3 className="text-milk-base font-semibold mb-2">Selected Protocols:</h3>
          <div className="flex gap-2 flex-wrap">
            {availableProtocols.map(protocol => (
              <label key={protocol} className="flex items-center gap-1 text-milk-base">
                <input 
                  type="checkbox"
                  checked={selectedProtocols.includes(protocol)}
                  onChange={() => handleProtocolToggle(protocol)}
                />
                {protocol}
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-milk-base font-semibold mb-2">Current Block:</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentBlock(b => b - 1)} className="px-2 py-1 bg-gray-700 text-white rounded">-</button>
            <input 
              type="number" 
              value={currentBlock} 
              onChange={(e) => setCurrentBlock(Number(e.target.value))}
              className="px-2 py-1 bg-gray-700 text-white rounded w-32 text-center"
            />
            <button onClick={() => setCurrentBlock(b => b + 1)} className="px-2 py-1 bg-gray-700 text-white rounded">+</button>
          </div>
        </div>
      </div>
      
      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="mb-4 bg-gray-800 p-4 rounded text-milk-base">
          <h3 className="font-semibold mb-2">Hook Outputs:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Filtered Pools: {filteredPools.length}</div>
            <div>Generated Nodes: {nodes.length}</div>
            <div>Generated Edges: {edges.length}</div>
            <div>Parallel Edge Groups: {parallelEdgeCount}</div>
            <div>API Logos Fetched: {console.log(`apiLogos: ${JSON.stringify(apiLogos)}`) || Object.keys(apiLogos).length}</div>
          </div>
        </div>
      )}
      
      {activeTab === 'hooks' && (
        <div className="mb-4 bg-gray-800 p-4 rounded text-milk-base overflow-auto max-h-48">
          <h3 className="font-semibold mb-2">Hook Details:</h3>
          <div className="space-y-2 text-xs font-mono">
            <div>
              <strong>Filtered Pools:</strong>
              <pre>{JSON.stringify(filteredPools.map(p => ({ id: p.id, protocol: p.protocol_system })), null, 2)}</pre>
            </div>
            <div>
              <strong>Nodes:</strong>
              <pre>{JSON.stringify(nodes.map(n => ({ id: n.id, label: n.label, hasImage: !!n.image })), null, 2)}</pre>
            </div>
            <div>
              <strong>Edges (first 5):</strong>
              <pre>{JSON.stringify(smoothEdges.slice(0, 5).map(e => ({ 
                id: e.id, 
                from: e.from, 
                to: e.to, 
                smooth: e.smooth 
              })), null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'data' && (
        <div className="mb-4 bg-gray-800 p-4 rounded text-milk-base overflow-auto max-h-48">
          <h3 className="font-semibold mb-2">Test Pools:</h3>
          <pre className="text-xs">{JSON.stringify(testPools, null, 2)}</pre>
        </div>
      )}
      
      {/* Graph Visualization */}
      <div 
        ref={containerRef} 
        className="flex-1 border-2 border-gray-600 rounded bg-gray-900"
        style={{ minHeight: '300px' }}
      />
      
      {/* Tooltips */}
      {selectedNode && (
        console.log('Rendering node tooltip at:', tooltipPosition) ||
        <div style={{ 
          position: 'fixed', 
          left: `${tooltipPosition.x}px`, 
          top: `${tooltipPosition.y - 20}px`, 
          zIndex: 9999,
          pointerEvents: 'none'
        }}>
          <NodeTooltip
            nodeData={getNodeData(selectedNode)}
            connectionData={getConnectionData(selectedNode, smoothEdges)}
            selectedChain="ethereum"
          />
        </div>
      )}
      
      {selectedEdge && (
        console.log('Rendering edge tooltip at:', tooltipPosition) ||
        console.log(`selectedEdge: ${selectedEdge}`) ||
        <div style={{ 
          position: 'fixed', 
          left: `${tooltipPosition.x}px`, 
          top: `${tooltipPosition.y - 20}px`, 
          zIndex: 9999,
          pointerEvents: 'none'
        }}>
          <EdgeTooltip
            pool={getPoolData(selectedEdge)}
            selectedChain="ethereum"
          />
        </div>
      )}
    </div>
  );
};