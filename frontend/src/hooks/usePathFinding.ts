import { useState, useEffect } from 'react';
import { Node, Edge, Path } from '@/components/dexscan/utils/graphUtils';
import { PathFinder } from '@/components/dexscan/graph/PathFinder';

export const usePathFinding = (nodes: Node[], edges: Edge[], selectedNode: string | null, targetNode: string | null) => {
  const [paths, setPaths] = useState<Path[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedNode || !targetNode) {
      setPaths([]);
      return;
    }

    setIsLoading(true);
    const pathFinder = new PathFinder(nodes, edges);
    
    try {
      const path = pathFinder.findPath(selectedNode, targetNode);
      if (path) {
        setPaths([path]);
      } else {
        setPaths([]);
      }
    } catch (error) {
      console.error('Error finding path:', error);
      setPaths([]);
    } finally {
      setIsLoading(false);
    }
  }, [nodes, edges, selectedNode, targetNode]);

  return { paths, isLoading };
};
