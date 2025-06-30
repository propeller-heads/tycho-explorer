/**
 * RenderPipeline - Manage vis-network instance
 * Minimal state: only network instance (necessary)
 */

import { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { updateNetworkData } from '@/components/dexscan/graph/network/NetworkUpdater';
import { getDefaultNetworkOptions } from '@/components/dexscan/graph/network/defaultNetworkOptions';

// Hook to manage network rendering
export function useNetwork(container, graph) {
  const networkRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const datasetsRef = useRef({ nodes: null, edges: null });
  
  // Track if we've initialized to avoid recreating
  const initializedRef = useRef(false);
  
  useEffect(() => {
    if (!container) return;
    
    // No data - destroy network if it exists
    if (!graph.nodes || graph.nodes.length === 0) {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
        datasetsRef.current = { nodes: null, edges: null };
        initializedRef.current = false;
        setIsReady(false);
      }
      return;
    }
    
    // Initialize network if not already done
    if (!initializedRef.current) {
      datasetsRef.current.nodes = new DataSet(graph.nodes);
      datasetsRef.current.edges = new DataSet(graph.edges);
      
      const network = new Network(
        container,
        datasetsRef.current,
        getDefaultNetworkOptions()
      );
      
      // Disable physics after stabilization
      network.once('stabilizationIterationsDone', () => {
        network.setOptions({ physics: false });
        setIsReady(true);
      });
      
      networkRef.current = network;
      initializedRef.current = true;
    } else {
      // Update existing network data
      updateNetworkData(
        networkRef.current,
        datasetsRef.current.nodes,
        datasetsRef.current.edges,
        graph.nodes,
        graph.edges
      );
    }
  }, [container, graph.nodes, graph.edges]); // Depend on graph data to handle initial empty state
  
  // Note: Graph updates are now handled in the main effect above since it depends on graph data
  
  // Cleanup only on unmount
  useEffect(() => {
    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
        datasetsRef.current = { nodes: null, edges: null };
        initializedRef.current = false;
        setIsReady(false);
      }
    };
  }, []); // Empty deps - only cleanup on unmount
  
  return { network: networkRef.current, isReady };
}