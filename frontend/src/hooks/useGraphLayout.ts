import { useState, useEffect, useRef } from 'react';
import { Node } from '@/components/dexscan/graph/types';

interface ForceSimulation {
  nodes: Array<{
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
  }>;
  alpha: number;
  alphaDecay: number;
  alphaMin: number;
  velocityDecay: number;
}

export function useGraphLayout(
  nodes: Node[], 
  width: number, 
  height: number
) {
  const [nodePositions, setNodePositions] = useState<{[key: string]: {x: number, y: number}}>({});
  const simulationRef = useRef<ForceSimulation | null>(null);
  const isStableRef = useRef(false);
  const frameIdRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  
  useEffect(() => {
    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (width === 0 || height === 0 || nodes.length === 0) return;
    
    if (frameIdRef.current !== null) {
      cancelAnimationFrame(frameIdRef.current);
      frameIdRef.current = null;
    }
    
    const maxTvl = Math.max(...nodes.map(node => node.tvl || 0));
    
    const initialPositions: {[key: string]: {x: number, y: number}} = {};
    const simulationNodes: ForceSimulation['nodes'] = [];
    
    const padding = Math.max(50, width * 0.1);
    const centerX = width / 2;
    const centerY = height / 2;
    
    const nodeCount = nodes.length;
    const nodesPerCircle = Math.min(40, Math.ceil(Math.sqrt(nodeCount) * 3));
    const circles = Math.ceil(nodeCount / nodesPerCircle);
    
    const maxRadius = Math.min(width, height) * 0.42 - padding;
    
    nodes.forEach((node, i) => {
      const circleIndex = Math.floor(i / nodesPerCircle);
      const nodesInThisCircle = Math.min(nodesPerCircle, nodeCount - circleIndex * nodesPerCircle);
      
      const angleStep = (2 * Math.PI) / nodesInThisCircle;
      const nodeIndexInCircle = i % nodesPerCircle;
      const angle = nodeIndexInCircle * angleStep;
      
      const circleRadius = maxRadius * ((circleIndex + 1) / circles);
      
      const x = centerX + circleRadius * Math.cos(angle);
      const y = centerY + circleRadius * Math.sin(angle);
      
      initialPositions[node.id] = { x, y };
      
      const minRadius = 3;
      const maxNodeRadius = 15;
      const tvl = node.tvl || 0;
      const scalingFactor = maxTvl > 0 ? tvl / maxTvl : 0;
      const nodeRadius = minRadius + scalingFactor * (maxNodeRadius - minRadius);
      
      simulationNodes.push({
        id: node.id,
        x,
        y,
        vx: 0,
        vy: 0,
        radius: nodeRadius
      });
    });
    
    setNodePositions(initialPositions);
    
    const simulation: ForceSimulation = {
      nodes: simulationNodes,
      alpha: 1,
      alphaDecay: 0.02,
      alphaMin: 0.001,
      velocityDecay: 0.4
    };
    
    simulationRef.current = simulation;
    isStableRef.current = false;
    lastUpdateTimeRef.current = Date.now();
    
    const runSimulation = () => {
      if (!simulation || simulation.alpha <= simulation.alphaMin) {
        isStableRef.current = true;
        return;
      }
      
      const centerForceStrength = 0.02;
      simulation.nodes.forEach(node => {
        const dx = centerX - node.x;
        const dy = centerY - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const initialPos = initialPositions[node.id];
        if (!initialPos) return;
        
        const initialDx = initialPos.x - centerX;
        const initialDy = initialPos.y - centerY;
        const desiredDistance = Math.sqrt(initialDx * initialDx + initialDy * initialDy);
        
        if (Math.abs(distance - desiredDistance) > 5) {
          const strength = centerForceStrength * simulation.alpha;
          
          if (distance > 0) {
            const factor = (desiredDistance / distance - 1) * strength;
            node.vx += dx * factor;
            node.vy += dy * factor;
          }
        }
      });
      
      const repulsionStrength = 1.0;
      for (let i = 0; i < simulation.nodes.length; i++) {
        const nodeA = simulation.nodes[i];
        
        for (let j = i + 1; j < simulation.nodes.length; j++) {
          const nodeB = simulation.nodes[j];
          
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const distanceSquared = dx * dx + dy * dy;
          const distance = Math.sqrt(distanceSquared);
          
          const minDistance = (nodeA.radius + nodeB.radius) * 2.5;
          
          if (distance < minDistance) {
            const strength = (repulsionStrength * simulation.alpha * (minDistance - distance)) / Math.max(distance, 0.1);
            
            const forceX = dx * strength;
            const forceY = dy * strength;
            
            nodeA.vx -= forceX;
            nodeA.vy -= forceY;
            nodeB.vx += forceX;
            nodeB.vy += forceY;
          }
        }
      }
      
      const boundaryStrength = 0.5;
      const padding = 50;
      
      simulation.nodes.forEach(node => {
        if (node.x < padding + node.radius) {
          node.vx += boundaryStrength * (padding + node.radius - node.x) * simulation.alpha;
        }
        if (node.x > width - padding - node.radius) {
          node.vx -= boundaryStrength * (node.x - (width - padding - node.radius)) * simulation.alpha;
        }
        if (node.y < padding + node.radius) {
          node.vy += boundaryStrength * (padding + node.radius - node.y) * simulation.alpha;
        }
        if (node.y > height - padding - node.radius) {
          node.vy -= boundaryStrength * (node.y - (height - padding - node.radius)) * simulation.alpha;
        }
      });
      
      simulation.nodes.forEach(node => {
        node.vx *= simulation.velocityDecay;
        node.vy *= simulation.velocityDecay;
        
        const maxVelocity = 2;
        const velocityMagnitude = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        if (velocityMagnitude > maxVelocity) {
          node.vx = (node.vx / velocityMagnitude) * maxVelocity;
          node.vy = (node.vy / velocityMagnitude) * maxVelocity;
        }
        
        node.x += node.vx;
        node.y += node.vy;
      });
      
      simulation.alpha *= (1 - simulation.alphaDecay);
      
      let totalMovement = 0;
      simulation.nodes.forEach(node => {
        totalMovement += Math.abs(node.vx) + Math.abs(node.vy);
      });
      
      const newPositions: {[key: string]: {x: number, y: number}} = {};
      simulation.nodes.forEach(node => {
        newPositions[node.id] = { x: node.x, y: node.y };
      });
      
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
      
      if (timeSinceLastUpdate > 33) {
        setNodePositions(newPositions);
        lastUpdateTimeRef.current = now;
      }
      
      if (simulation.alpha > simulation.alphaMin && totalMovement > 0.05) {
        frameIdRef.current = requestAnimationFrame(runSimulation);
      } else {
        setNodePositions(newPositions);
        isStableRef.current = true;
      }
    };
    
    frameIdRef.current = requestAnimationFrame(runSimulation);
    
    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
    };
  }, [nodes, width, height]);
  
  useEffect(() => {
    if (width === 0 || height === 0 || !simulationRef.current || nodes.length === 0) return;
    
    if (isStableRef.current) {
      const centerX = width / 2;
      const centerY = height / 2;
      const padding = 50;
      
      const newPositions: {[key: string]: {x: number, y: number}} = {};
      simulationRef.current.nodes.forEach(node => {
        const x = Math.max(padding + node.radius, Math.min(width - padding - node.radius, node.x));
        const y = Math.max(padding + node.radius, Math.min(height - padding - node.radius, node.y));
        
        newPositions[node.id] = { x, y };
      });
      
      setNodePositions(newPositions);
    }
  }, [width, height, nodes]);

  return { nodePositions };
}
