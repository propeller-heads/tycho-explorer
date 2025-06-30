/**
 * InteractPipeline - Handle user interactions
 * Minimal state: only current selection (UI state)
 */

import { useState, useEffect } from 'react';

// Hook to handle network interactions
export function useInteractions(network) {
  const [selection, setSelection] = useState(null);
  
  useEffect(() => {
    if (!network) return;
    
    const handleClick = (params) => {
      // Check what was clicked
      if (params.nodes.length > 0) {
        setSelection({
          type: 'node',
          id: params.nodes[0],
          position: params.pointer.DOM
        });
      } else if (params.edges.length > 0) {
        setSelection({
          type: 'edge',
          id: params.edges[0],
          position: params.pointer.DOM
        });
      } else {
        // Clicked on empty space
        setSelection(null);
      }
    };
    
    // Add event listeners
    network.on('click', handleClick);
    
    // Hide tooltips on zoom/drag
    network.on('zoom', () => setSelection(null));
    network.on('dragStart', () => setSelection(null));
    
    // Cleanup
    return () => {
      network.off('click', handleClick);
      network.off('zoom');
      network.off('dragStart');
    };
  }, [network]);
  
  return selection;
}