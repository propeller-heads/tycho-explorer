
import { useState, useEffect } from 'react';

type NodeInteractionProps = {
  onNodeSelection?: (nodeId: string | null, isTarget?: boolean) => void;
  onNodeClick?: (nodeId: string) => void;
  initialSelectedNode?: string | null;
  initialTargetNode?: string | null;
};

export function useNodeInteraction({
  onNodeSelection,
  onNodeClick,
  initialSelectedNode = null,
  initialTargetNode = null
}: NodeInteractionProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(initialSelectedNode);
  const [targetNode, setTargetNode] = useState<string | null>(initialTargetNode);
  
  useEffect(() => {
    setSelectedNode(initialSelectedNode);
  }, [initialSelectedNode]);
  
  useEffect(() => {
    setTargetNode(initialTargetNode);
  }, [initialTargetNode]);
  
  const handleClick = () => {
    if (!hoveredNode) {
      // Clear selection when clicking on empty space
      setSelectedNode(null);
      setTargetNode(null);
      if (onNodeSelection) {
        onNodeSelection(null);
        onNodeSelection(null, true);
      }
      return;
    }
    
    if (hoveredNode === selectedNode) {
      // Deselect source node
      setSelectedNode(null);
      if (onNodeSelection) onNodeSelection(null);
      if (onNodeClick) onNodeClick(hoveredNode);
    } else if (hoveredNode === targetNode) {
      // Deselect target node
      setTargetNode(null);
      if (onNodeSelection) onNodeSelection(null, true);
    } else if (selectedNode && !targetNode) {
      // Set target node when source is already selected
      setTargetNode(hoveredNode);
      if (onNodeSelection) onNodeSelection(hoveredNode, true);
    } else {
      // Set source node, clear target
      setSelectedNode(hoveredNode);
      setTargetNode(null);
      if (onNodeSelection) {
        onNodeSelection(hoveredNode);
        onNodeSelection(null, true);
      }
      if (onNodeClick) onNodeClick(hoveredNode);
    }
  };

  return {
    hoveredNode,
    setHoveredNode,
    selectedNode,
    setSelectedNode,
    targetNode,
    setTargetNode,
    handleClick
  };
}
