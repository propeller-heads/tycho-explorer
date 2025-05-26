import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { parsePoolFee } from '@/lib/poolUtils'; // Import for fee parsing
import { Pool as PoolType } from '@/components/dexscan/types'; // Import Pool type
import { renderHexId, formatTimeAgo } from '@/lib/utils'; // Import renderHexId and formatTimeAgo

// Define the network options
const networkOptions = {
  autoResize: true,
  nodes: {
    shape: "circle", // Default shape, will be overridden by 'circularImage' for nodes with images
    size: 24, // Default size for nodes, including circularImage
    color: {
      border: "rgba(255, 244, 224, 0.2)", // Subtle light border for fallback circle
      background: "rgba(255, 244, 224, 0.04)", // Warm cream background matching List View
      highlight: {
        border: "#FF3366", // Folly Red for selection
        background: "rgba(255, 244, 224, 0.08)", // Slightly brighter warm cream
      },
      hover: {
        border: "rgba(255, 244, 224, 0.5)",
        background: "rgba(255, 244, 224, 0.06)", // Warm cream hover
      }
    },
    borderWidth: 6,
    // borderWidthSelected is handled programmatically in GraphManager for #FF3366
    font: {
      size: 16, // px
      color: "rgba(255, 244, 224, 1)", // Warm cream text 
      face: "Inter, Arial, sans-serif",
      vadjust: 0,
    },
    // mass: 1, // Default
    physics: true, // Default
  },
  edges: {
    width: 1,
    color: {
      color: "rgba(255, 244, 224, 0.15)", // Very subtle default edge
      highlight: "rgba(255, 244, 224, 0.4)",
      hover: "rgba(255, 244, 224, 0.4)",
      inherit: false, // Assuming dynamic coloring for protocols etc.
    },
    smooth: {
      enabled: true,
      type: "continuous", // For straighter default lines; parallel curves handled elsewhere
      roundness: 0.05     // Very slight curve, almost straight
    },
    // physics: true, // Default
  },
  physics: {
    enabled: true,
    solver: 'barnesHut', // Default, generally good for non-hierarchical
    barnesHut: {
      gravitationalConstant: -25000, // Increased repulsion
      centralGravity: 0.1,           // Reduced pull to center
      springLength: 300,             // Increased for more node separation
      springConstant: 0.03,          // Might need slight reduction with longer springs
      damping: 0.09,                 // Standard
      avoidOverlap: 0.7              // Increased to prevent node overlap
    },
    adaptiveTimestep: true, // Default
    // Stabilization options:
    // fit: false is crucial to prevent the graph from resetting user's zoom/pan
    // on data updates (e.g., new block). Vis-network defaults fit to true,
    // which causes the view to re-center and re-zoom to fit all nodes.
    stabilization: { 
      enabled: true, // Or false if you don't want initial stabilization iterations
      iterations: 1000, // Default, adjust if needed
      fit: false,       // Prevents auto-fitting the graph on data changes / initial load
      // updateInterval: 50, // Default
      // iterationsPerUpdate: 10 // Default
    }
  },
  layout: {
    randomSeed: 42, // Or a specific seed once a good layout is found
    hierarchical: {
      enabled: false // TC Design is not hierarchical
    },
    // improvedLayout: true, // Default
  },
  interaction: {
    hover: true, // To see hover effects
    tooltipDelay: 200, // Default 300
    // Other interaction defaults are usually fine
  }
};


// Minimal types for rawPoolsData, assuming structure from PoolDataContext/useGraphData
interface RawToken {
  address: string;
}

interface RawPool { // This is used for getTokenData, can remain minimal
  id: string;
  tokens: RawToken[];
}

// Props interface
interface GraphViewProps {
  tokenNodes: Array<{ id: string; label: string; symbol?: string }>;
  poolEdges: Array<{ id: string; from: string; to: string; protocol: string; width?: number; color?: string; lastUpdatedAtBlock?: number }>;
  rawPoolsData: Record<string, PoolType>; // Use the more complete PoolType here
  currentBlockNumber?: number; // Add this to track current block
}

// Class to manage the network and position cache
class GraphManager {
  private network: Network | null = null;
  private nodesDataset: DataSet<any> | null = null;
  private edgesDataset: DataSet<any> | null = null;
  public rawPoolsData: Record<string, PoolType> // Changed RawPool to PoolType
  private initialized = false;
  private container: HTMLElement | null = null;
  private popupDiv: HTMLElement | null = null; // For node tooltips
  private currentEdgePopover: { element: HTMLElement; poolId: string } | null = null; // For edge popovers
  private activeTimeout: NodeJS.Timeout | null = null;
  private selectedNodeId: string | null = null; // To track selected node
  private boundHandleDocumentMousedown: ((event: MouseEvent) => void) | null = null;
  private currentBlockNumber: number = 0; // Track current block number

  initialize(container: HTMLElement, initialNodes: any[], initialEdges: any[], rawPools: Record<string, PoolType>, currentBlockNumber?: number) {
    this.rawPoolsData = rawPools; // Store raw pools data
    this.boundHandleDocumentMousedown = this.handleDocumentMousedown.bind(this);
    this.container = container;
    this.currentBlockNumber = currentBlockNumber || 0;

    // Create datasets
    this.nodesDataset = new DataSet(initialNodes);
    this.edgesDataset = new DataSet(initialEdges);

    // Node labels are assumed to be set correctly (just symbol) by useGraphData
    // No need for the address formatting loop here if useGraphData provides final labels.
    // const nodes = this.nodesDataset.get();
    // nodes.forEach(node => { ... });

    // Create network
    this.network = new Network(
      container,
      { nodes: this.nodesDataset, edges: this.edgesDataset },
      networkOptions
    );

    // Listen for initial stabilization to be done, then fit the network
    // This ensures the graph is nicely framed on initial load.
    // Subsequent zoom/pan by the user will be preserved due to `physics.stabilization.fit: false`.
    this.network.once('stabilizationIterationsDone', () => {
      if (this.network) { // Ensure network still exists
        this.network.fit();
      }
    });

    // Add click event handler for nodes and edges
    this.network.on('click', (params) => {
      const clickedNodeId = params.nodes.length > 0 ? params.nodes[0] : null;
      const clickedEdgeId = params.edges.length > 0 ? params.edges[0] : null;
      const previousSelectedNodeId = this.selectedNodeId;
      const clickEvent = params.event?.center || { x: 0, y: 0 }; // DOM click coordinates

      // Always hide any existing popups (node or edge) first
      this.hidePopup(); // This is the existing node tooltip popup
      this.hideEdgeInfoPopover(); // New method for edge popover

      if (clickedNodeId) {
        // A node was clicked
        // Revert style of the previously selected node (if any)
        if (previousSelectedNodeId && previousSelectedNodeId !== clickedNodeId) {
            this.nodesDataset?.update({
              id: previousSelectedNodeId,
              borderWidth: networkOptions.nodes.borderWidth,
              color: {
                border: networkOptions.nodes.color.border,
                background: networkOptions.nodes.color.background,
                highlight: networkOptions.nodes.color.highlight
              }
            });
          }
        
        // Apply selected style to the new node if it's not already selected or re-clicked
        if (clickedNodeId !== previousSelectedNodeId) {
          this.nodesDataset?.update({
            id: clickedNodeId,
            borderWidth: 2, // Selected border width
            color: {
              border: '#FF3366', // Selected border color
              background: networkOptions.nodes.color.background, // Keep original background
              highlight: { // Keep highlight consistent or adjust if needed
                border: '#FF3366',
                background: networkOptions.nodes.color.highlight.background
              }
            }
          });
        }
        this.selectedNodeId = clickedNodeId; // Update selected node ID

        // Show tooltip for the new node.
        // Using setTimeout for consistent behavior, especially if re-clicking the same node.
        setTimeout(() => {
          if (this.selectedNodeId === clickedNodeId) { // Check if still selected
            const tokenData = this.getTokenData(clickedNodeId);
            this.showTokenInfo(clickedNodeId, tokenData, clickEvent); // This will add the doc listener
          }
        }, 50);

      } else if (clickedEdgeId) {
        // An edge was clicked
        // Deselect any currently selected node
        if (previousSelectedNodeId) {
          this.nodesDataset?.update({
            id: previousSelectedNodeId,
            borderWidth: networkOptions.nodes.borderWidth,
            color: {
              border: networkOptions.nodes.color.border,
              background: networkOptions.nodes.color.background,
              highlight: networkOptions.nodes.color.highlight
            }
          });
        }
        this.selectedNodeId = null; 
        
        // Show edge popover
        this.showEdgeInfoPopover(clickedEdgeId, clickEvent.x, clickEvent.y);

      } else {
        // Clicked on CANVAS (not a node or edge)
        // Deselect any currently selected node
        if (previousSelectedNodeId) {
          this.nodesDataset?.update({
            id: previousSelectedNodeId,
            borderWidth: networkOptions.nodes.borderWidth,
            color: {
              border: networkOptions.nodes.color.border,
              background: networkOptions.nodes.color.background,
              highlight: networkOptions.nodes.color.highlight
            }
          });
        }
        this.selectedNodeId = null; // No node is selected.
      }
    });

    // Add zoom handler to hide popups when zooming
    this.network.on('zoom', () => {
      this.hidePopup();
      this.hideEdgeInfoPopover();
    });

    // Add drag handler to hide popups when dragging
    this.network.on('dragStart', () => {
      this.hidePopup();
      this.hideEdgeInfoPopover();
    });

    this.initialized = true;
  }

  // Fetches token data for node tooltips
  getTokenData(nodeId: string) {
    if (!this.rawPoolsData) return { poolCount: 0, address: nodeId };
    let poolCount = 0;
    // Ensure this.rawPoolsData is Record<string, PoolType>
    const poolsTyped = this.rawPoolsData as Record<string, PoolType>;
    for (const poolId in poolsTyped) {
      const pool = poolsTyped[poolId];
      if (pool.tokens.some(token => token.address === nodeId)) {
        poolCount++;
      }
    }
    return { poolCount, address: nodeId };
  }

  // Displays the node tooltip
  showPopup(nodeId: string, content: string, options: { position: { x: number, y: number }, direction: string }) {
    if (!this.network || !this.container) return;

    // Clean up any existing popup
    this.hidePopup();

    // Create popup div if it doesn't exist yet
    if (!this.popupDiv) {
      this.popupDiv = document.createElement('div');
      this.popupDiv.style.position = 'fixed'; // Use fixed positioning for better stability
      this.popupDiv.style.zIndex = '1000';
      this.popupDiv.style.pointerEvents = 'auto';
      document.body.appendChild(this.popupDiv); // Attach to body for best positioning
    }

    // Add content to popup
    this.popupDiv.innerHTML = content;

    // Add event listener for the copy button for node address
    const copyNodeAddressButton = this.popupDiv.querySelector('#copy-node-address-button');
    if (copyNodeAddressButton) {
      copyNodeAddressButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent the click from closing the tooltip or triggering other graph events
        const addressToCopy = copyNodeAddressButton.getAttribute('data-address-to-copy');
        if (addressToCopy) {
          navigator.clipboard.writeText(addressToCopy)
            .then(() => {
              copyNodeAddressButton.textContent = 'Copied!';
              setTimeout(() => {
                copyNodeAddressButton.textContent = 'Copy';
              }, 1500);
            })
            .catch(err => {
              console.error('Failed to copy address:', err);
            });
        }
      });
    }

    // Directly get node position using the node ID
    // Note: positions are in graph coordinates, not DOM coordinates
    const nodePosition = this.network.getPositions([nodeId])[nodeId];

    if (!nodePosition) {
      // Fallback: If node position is not available (unlikely), use the click position
      console.warn(`Node position not found for nodeId: ${nodeId}. Using click position.`);
      this.popupDiv.style.left = `${options.position.x}px`;
      this.popupDiv.style.top = `${options.position.y - 100}px`; // Offset above
    } else {
      // Convert graph coordinates to DOM coordinates
      const domPosition = this.network.canvasToDOM(nodePosition);
      
      // Position above the node
      const offset = 60; // Adjust this value based on node size + margin
      this.popupDiv.style.left = `${domPosition.x}px`;
      this.popupDiv.style.top = `${domPosition.y - offset}px`;
      this.popupDiv.style.transform = 'translateX(-50%)'; // Center horizontally
    }

    // Clear any existing timeout
    if (this.activeTimeout) {
      clearTimeout(this.activeTimeout);
      this.activeTimeout = null;
    }
  }

  hidePopup() {
    if (this.popupDiv) {
      // Instead of removing, make invisible for potential reuse
      this.popupDiv.style.display = 'none';
    }

    if (this.activeTimeout) {
      clearTimeout(this.activeTimeout);
      this.activeTimeout = null;
    }

    // Remove the document event listener when hiding popup
    if (this.boundHandleDocumentMousedown) {
      document.removeEventListener('mousedown', this.boundHandleDocumentMousedown);
    }
  }

  showTokenInfo(nodeId: string, data: { poolCount: number, address: string }, clickEvent?: { x: number, y: number }) {
    // Add event listener to close popup when clicking outside
    if (this.boundHandleDocumentMousedown) {
      // Add a small delay before attaching the event listener
      // This prevents the popup from immediately closing if the click event propagates
      setTimeout(() => {
        document.addEventListener('mousedown', this.boundHandleDocumentMousedown);
      }, 100);
    }

    const address = data.address;
    const shortAddress = address && address.length >= 10 
      ? `${address.slice(0, 6)}...${address.slice(-4)}` 
      : address;

    // Get node data
    const node = this.nodesDataset?.get(nodeId);

    // Create HTML content for popup
    // Applying styles based on Figma's tooltip (7903:5709)
    const content = `
      <div style="
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        padding: 16px; 
        background-color: rgba(255, 244, 224, 0.04); 
        color: #FFF4E0; 
        border-radius: 8px; 
        border: 1px solid rgba(255, 244, 224, 0.2); 
        box-shadow: 0px 4px 16px 0px rgba(37, 0, 63, 0.2);
        backdrop-filter: blur(10.4px);
        -webkit-backdrop-filter: blur(10.4px);
        min-width: 200px; /* Ensure a reasonable minimum width */
      ">        
        <div style="margin-bottom: 8px;">
          <span style="color: rgba(255, 244, 224, 0.64);">Pools: </span>
          <span id="tooltip-pool-count" style="color: #FFF4E0;">${data.poolCount}</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="color: rgba(255, 244, 224, 0.64);">Address: </span>
            <a href="https://etherscan.io/token/${data.address}" 
               target="_blank" 
               rel="noopener noreferrer"
               style="color: rgba(255, 244, 224, 0.64); text-decoration: underline; word-break: break-all;">${shortAddress}</a>
          </div>
          <button id="copy-node-address-button" 
                  data-address-to-copy="${data.address}"
                  style="margin-left: 8px; padding: 2px 6px; font-size: 10px; color: rgba(255, 244, 224, 0.64); background-color: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 244, 224, 0.2); border-radius: 4px; cursor: pointer;">
            Copy
          </button>
        </div>
      </div>
    `;

    // Show popup above the node
    this.showPopup(nodeId, content, {
      position: clickEvent || { x: 0, y: 0 },
      direction: 'center'
    });
  }

  updateData(newNodesData: any[], newEdgesData: any[], currentBlockNumber?: number) {
    if (!this.nodesDataset || !this.edgesDataset || !this.network) return;

    // Update current block number
    if (currentBlockNumber !== undefined) {
      console.log(`🟩 GraphView updateData - new block: ${currentBlockNumber}, edges: ${newEdgesData.length}`);
      this.currentBlockNumber = currentBlockNumber;
    }

    // --- Nodes Diffing and Updating ---
    // Get current nodes as a Map for efficient lookup
    const currentNodesMap = new Map(this.nodesDataset.get({ returnType: 'Array' }).map(node => [node.id, node]));
    // Create a Map of new nodes for efficient lookup
    const newNodesMap = new Map(newNodesData.map(node => [node.id, node]));

    const nodesToAdd = [];
    const nodesToUpdate = []; // Payloads for nodes that exist and might have changed properties
    const nodeIdsToRemove = [];

    // Identify nodes to add or prepare for update
    for (const newNode of newNodesData) {
      if (currentNodesMap.has(newNode.id)) {
        // Node exists, prepare an update payload.
        // IMPORTANT: Exclude x and y coordinates from the update payload
        // to allow vis-network's physics engine to preserve existing positions
        // or adjust them smoothly, rather than resetting them.
        const { x, y, ...updatePayload } = newNode;
        // TODO: Implement a more sophisticated diff here if only specific property changes should trigger an update.
        // For now, we assume any existing node passed in newNodesData might need an update.
        nodesToUpdate.push(updatePayload);
      } else {
        // Node is new, add it.
        nodesToAdd.push(newNode);
      }
    }

    // Identify nodes to remove
    currentNodesMap.forEach((_, nodeId) => {
      if (!newNodesMap.has(nodeId)) {
        nodeIdsToRemove.push(nodeId);
      }
    });

    if (nodesToAdd.length > 0) {
      this.nodesDataset.add(nodesToAdd);
    }
    if (nodesToUpdate.length > 0) {
      // vis-data's update method handles matching by id and merging properties.
      this.nodesDataset.update(nodesToUpdate);
    }
    if (nodeIdsToRemove.length > 0) {
      this.nodesDataset.remove(nodeIdsToRemove);
    }

    // --- Edges Diffing and Updating ---
    // Get current edges as a Map
    const currentEdgesMap = new Map(this.edgesDataset.get({ returnType: 'Array' }).map(edge => [edge.id, edge]));
    // Create a Map of new edges
    const newEdgesMap = new Map(newEdgesData.map(edge => [edge.id, edge]));
    
    const edgesToAdd = [];
    const edgesToUpdate = []; // Edges don't have x/y positions managed by physics in the same way nodes do.
                              // Their appearance is determined by 'from' and 'to' nodes and 'smooth' options.
    const edgeIdsToRemove = [];

    // Identify edges to add or update
    for (const newEdge of newEdgesData) {
      if (currentEdgesMap.has(newEdge.id)) {
        // Edge exists, check if it needs width update based on block update
        const currentEdge = currentEdgesMap.get(newEdge.id);
        
        // Debug log width changes
        if (currentEdge.width !== newEdge.width) {
          console.log(`🟨 Edge ${newEdge.id} WIDTH CHANGE DETECTED:`, {
            oldWidth: currentEdge.width,
            newWidth: newEdge.width,
            lastUpdatedAtBlock: newEdge.lastUpdatedAtBlock,
            currentBlock: this.currentBlockNumber
          });
        } else if (newEdge.lastUpdatedAtBlock === this.currentBlockNumber) {
          console.log(`🟨 Edge ${newEdge.id} NO WIDTH CHANGE but updated this block:`, {
            width: newEdge.width,
            lastUpdatedAtBlock: newEdge.lastUpdatedAtBlock,
            currentBlock: this.currentBlockNumber
          });
        }
        
        // Always update the edge to ensure width changes are applied
        edgesToUpdate.push(newEdge); 
      } else {
        // Edge is new, add it.
        edgesToAdd.push(newEdge);
      }
    }

    // Identify edges to remove
    currentEdgesMap.forEach((_, edgeId) => {
      if (!newEdgesMap.has(edgeId)) {
        edgeIdsToRemove.push(edgeId);
      }
    });

    if (edgesToAdd.length > 0) {
      this.edgesDataset.add(edgesToAdd);
    }
    if (edgesToUpdate.length > 0) {
      this.edgesDataset.update(edgesToUpdate);
    }
    if (edgeIdsToRemove.length > 0) {
      this.edgesDataset.remove(edgeIdsToRemove);
    }
    
    // After updating datasets, it might be necessary to explicitly tell the network to redraw
    // if changes aren't automatically picked up for some reason, though typically DataSet events handle this.
    // this.network.redraw(); // Usually not needed if DataSets are correctly linked.
  }

  refreshCurrentTooltipData() {
    if (this.popupDiv && this.selectedNodeId) {
      const poolCountSpan = this.popupDiv.querySelector('#tooltip-pool-count');
      if (poolCountSpan) {
        const freshTokenData = this.getTokenData(this.selectedNodeId);
        poolCountSpan.textContent = freshTokenData.poolCount.toString();
      }
    }
  }

  cleanup() {
    // Hide popups
    this.hidePopup();
    this.hideEdgeInfoPopover();

    // Remove event listeners
    if (this.boundHandleDocumentMousedown) {
      document.removeEventListener('mousedown', this.boundHandleDocumentMousedown);
    }

    // Clean up the popup div
    if (this.popupDiv && this.popupDiv.parentNode) {
      this.popupDiv.parentNode.removeChild(this.popupDiv);
      this.popupDiv = null;
    }

    // Clean up the edge popover
    if (this.currentEdgePopover && this.currentEdgePopover.element.parentNode) {
      this.currentEdgePopover.element.parentNode.removeChild(this.currentEdgePopover.element);
      this.currentEdgePopover = null;
    }

    // Destroy network
    if (this.network) {
      this.network.destroy();
      this.network = null;
    }

    // Clear datasets
    this.nodesDataset = null;
    this.edgesDataset = null;
    this.container = null;
    this.initialized = false;
    this.selectedNodeId = null;
  }

  // Handle clicks outside the popup to close it
  private handleDocumentMousedown(event: MouseEvent) {
    if (this.popupDiv && this.popupDiv.style.display !== 'none') {
      // Check if the click was inside the popup
      if (!this.popupDiv.contains(event.target as Node)) {
        this.hidePopup();
        // Deselect the node
        if (this.selectedNodeId) {
          this.nodesDataset?.update({
            id: this.selectedNodeId,
            borderWidth: networkOptions.nodes.borderWidth,
            color: {
              border: networkOptions.nodes.color.border,
              background: networkOptions.nodes.color.background,
              highlight: networkOptions.nodes.color.highlight
            }
          });
          this.selectedNodeId = null;
        }
      }
    }
  }

  // Returns the vis-network instance
  getNetwork() {
    return this.network;
  }

  // Update raw pool data when needed
  updateRawPoolsData(newRawPoolsData: Record<string, PoolType>) {
    this.rawPoolsData = newRawPoolsData;
    // If a tooltip is currently open, refresh its data
    this.refreshCurrentTooltipData();
  }

  // =========================
  // Edge Popover Methods
  // =========================

  showEdgeInfoPopover(edgeId: string, x: number, y: number) {
    if (!this.network || !this.container || !this.rawPoolsData) return;

    // Hide any existing edge popover
    this.hideEdgeInfoPopover();

    // Directly retrieve the pool data using the edge ID (which should be the pool ID)
    const pool = this.rawPoolsData[edgeId] as PoolType;
    if (!pool) {
      console.warn(`Pool not found for edge ID: ${edgeId}`);
      return;
    }

    // Get edge data to get protocol color for styling
    const edge = this.edgesDataset?.get(edgeId);
    const edgeColor = edge?.color || 'rgba(255, 244, 224, 0.64)';

    // Format timestamps
    const lastBlockUpdateTimeAgo = pool.lastBlockTimestamp 
      ? formatTimeAgo(pool.lastBlockTimestamp)
      : 'Unknown';

    // Create popover element
    const popoverElement = document.createElement('div');
    popoverElement.style.cssText = `
      position: fixed;
      z-index: 1001;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      padding: 16px;
      background-color: rgba(255, 244, 224, 0.04);
      color: #FFF4E0;
      border-radius: 8px;
      border: 1px solid rgba(255, 244, 224, 0.2);
      box-shadow: 0px 4px 16px 0px rgba(37, 0, 63, 0.2);
      backdrop-filter: blur(10.4px);
      -webkit-backdrop-filter: blur(10.4px);
      min-width: 280px;
      max-width: 350px;
    `;

    // Create content with more comprehensive pool information
    const content = `
      <div style="margin-bottom: 12px; border-bottom: 1px solid rgba(255, 244, 224, 0.1); padding-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <div style="width: 12px; height: 12px; background-color: ${edgeColor}; border-radius: 2px;"></div>
          <span style="font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">
            ${pool.protocol_system}
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 4px; font-size: 18px; font-weight: 600;">
          ${pool.tokens[0]?.symbol || 'Unknown'} / ${pool.tokens[1]?.symbol || 'Unknown'}
        </div>
      </div>

      <div style="margin-bottom: 12px;">
        <div style="color: rgba(255, 244, 224, 0.64); font-size: 11px; margin-bottom: 4px;">Pool ID</div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="color: rgba(255, 244, 224, 0.8); font-family: monospace; font-size: 12px;">
            ${renderHexId(pool.id)}
          </span>
          <button data-pool-id="${pool.id}"
                  style="padding: 2px 6px; font-size: 10px; color: rgba(255, 244, 224, 0.64); 
                         background-color: rgba(255, 255, 255, 0.1); 
                         border: 1px solid rgba(255, 244, 224, 0.2); 
                         border-radius: 4px; cursor: pointer;">
            Copy
          </button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
        <div>
          <div style="color: rgba(255, 244, 224, 0.64); font-size: 11px; margin-bottom: 2px;">Fee</div>
          <div style="font-weight: 500;">${parsePoolFee(pool)}%</div>
        </div>
        <div>
          <div style="color: rgba(255, 244, 224, 0.64); font-size: 11px; margin-bottom: 2px;">Last Update</div>
          <div style="font-weight: 500;">${lastBlockUpdateTimeAgo}</div>
        </div>
      </div>

      <div>
        <div style="color: rgba(255, 244, 224, 0.64); font-size: 11px; margin-bottom: 4px;">Spot Price</div>
        <div style="font-size: 14px; font-weight: 500;">
          1 ${pool.tokens[0]?.symbol || '???'} = ${parseFloat(pool.spotPrice || '0').toFixed(6)} ${pool.tokens[1]?.symbol || '???'}
        </div>
      </div>
    `;

    popoverElement.innerHTML = content;

    // Position the popover
    const popoverRect = { width: 350, height: 300 }; // Approximate dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = x;
    let top = y + 20; // Offset below click point

    // Adjust if goes off right edge
    if (left + popoverRect.width > viewportWidth) {
      left = viewportWidth - popoverRect.width - 20;
    }

    // Adjust if goes off bottom edge
    if (top + popoverRect.height > viewportHeight) {
      top = y - popoverRect.height - 20; // Show above instead
    }

    popoverElement.style.left = `${left}px`;
    popoverElement.style.top = `${top}px`;

    // Add to document
    document.body.appendChild(popoverElement);

    // Add copy button event listener
    const copyButton = popoverElement.querySelector('button');
    if (copyButton) {
      copyButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const poolId = copyButton.getAttribute('data-pool-id');
        if (poolId) {
          navigator.clipboard.writeText(poolId)
            .then(() => {
              copyButton.textContent = 'Copied!';
              setTimeout(() => {
                copyButton.textContent = 'Copy';
              }, 1500);
            })
            .catch(err => {
              console.error('Failed to copy pool ID:', err);
            });
        }
      });
    }

    // Store reference
    this.currentEdgePopover = { element: popoverElement, poolId: pool.id };

    // Add click outside handler
    setTimeout(() => {
      const clickOutsideHandler = (event: MouseEvent) => {
        if (!popoverElement.contains(event.target as Node)) {
          this.hideEdgeInfoPopover();
          document.removeEventListener('mousedown', clickOutsideHandler);
        }
      };
      document.addEventListener('mousedown', clickOutsideHandler);
    }, 100);
  }

  hideEdgeInfoPopover() {
    if (this.currentEdgePopover && this.currentEdgePopover.element.parentNode) {
      this.currentEdgePopover.element.parentNode.removeChild(this.currentEdgePopover.element);
      this.currentEdgePopover = null;
    }
  }
}

// Singleton instance
let graphManager: GraphManager | null = null;

// Export default component
export default function GraphView({ tokenNodes, poolEdges, rawPoolsData, currentBlockNumber }: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize and update graph
  useEffect(() => {
    if (!containerRef.current) return;

    if (!graphManager) {
      graphManager = new GraphManager();
      graphManager.initialize(containerRef.current, tokenNodes, poolEdges, rawPoolsData, currentBlockNumber);
    } else {
      graphManager.updateData(tokenNodes, poolEdges, currentBlockNumber);
      graphManager.updateRawPoolsData(rawPoolsData);
    }
  }, [tokenNodes, poolEdges, rawPoolsData, currentBlockNumber]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (graphManager) {
        graphManager.cleanup();
        graphManager = null;
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full" />
  );
}