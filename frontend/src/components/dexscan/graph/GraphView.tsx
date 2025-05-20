import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { parsePoolFee } from '@/lib/poolUtils'; // Import for fee parsing
import { Pool as PoolType } from '@/components/dexscan/types'; // Import Pool type
import { getExternalLink, renderHexId } from '@/lib/utils'; // Import getExternalLink and renderHexId

// Define the network options
const networkOptions = {
  autoResize: true,
  nodes: {
    shape: "circle", // Default shape, will be overridden by 'circularImage' for nodes with images
    size: 24, // Default size for nodes, including circularImage
    color: {
      border: "rgba(255, 244, 224, 0.2)", // Subtle light border for fallback circle
      background: "rgba(10, 10, 20, 0.8)", // Very dark background for fallback circle
      highlight: {
        border: "#FF3366", // Folly Red for selection
        background: "rgba(30, 30, 40, 0.9)",
      },
      hover: {
        border: "rgba(255, 244, 224, 0.5)",
        background: "rgba(30, 30, 40, 0.9)",
      }
    },
    borderWidth: 6,
    // borderWidthSelected is handled programmatically in GraphManager for #FF3366
    font: {
      size: 16, // px
      color: "#EAEAEA", 
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
  poolEdges: Array<{ id: string; from: string; to: string; protocol: string; width?: number; color?: string }>;
  rawPoolsData: Record<string, PoolType>; // Use the more complete PoolType here
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

  initialize(container: HTMLElement, initialNodes: any[], initialEdges: any[], rawPools: Record<string, PoolType>) {
    this.rawPoolsData = rawPools; // Store raw pools data
    this.boundHandleDocumentMousedown = this.handleDocumentMousedown.bind(this);
    this.container = container;

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
                // Check if button still exists before trying to change text
                if (copyNodeAddressButton) copyNodeAddressButton.textContent = 'Copy'; 
              }, 1500);
            })
            .catch(err => {
              console.error('Failed to copy node address: ', err);
            });
        }
      });
    }

    // Display the popup so we can calculate its height
    this.popupDiv.style.display = 'block';

    // Position the popup centered horizontally and above the node
    const popupHeight = this.popupDiv.offsetHeight;
    const popupWidth = this.popupDiv.offsetWidth;

    // Get the client position from the click event
    const clickX = options.position.x;
    const clickY = options.position.y;

    // Position popup directly above the click position
    this.popupDiv.style.left = `${clickX - (popupWidth / 2)}px`;
    this.popupDiv.style.top = `${clickY - popupHeight - 20}px`;

    // Add document mousedown listener only when popup is shown
    if (this.boundHandleDocumentMousedown) {
      document.addEventListener('mousedown', this.boundHandleDocumentMousedown, true); // Use capture phase
    }
  }

  private handleDocumentMousedown(event: MouseEvent) {
    let clickedInsideANodePopup = false;
    if (this.popupDiv && this.popupDiv.contains(event.target as Node)) {
      clickedInsideANodePopup = true;
    }

    let clickedInsideAnEdgePopup = false;
    if (this.currentEdgePopover && this.currentEdgePopover.element.contains(event.target as Node)) {
      clickedInsideAnEdgePopup = true;
    }

    if (!clickedInsideANodePopup && !clickedInsideAnEdgePopup) {
      // Clicked outside of any active popups
      this.hidePopup(); // Hide node popup
      this.hideEdgeInfoPopover(); // Hide edge popup

      if (this.selectedNodeId) {
        // Revert previously selected node to default styling
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

  // Hides the node tooltip
  hidePopup() {
    if (this.activeTimeout) {
      clearTimeout(this.activeTimeout);
      this.activeTimeout = null;
    }

    if (this.popupDiv) {
      // Remove the popup from the DOM entirely
      if (this.popupDiv.parentNode) {
        this.popupDiv.parentNode.removeChild(this.popupDiv);
      }
      this.popupDiv = null;
      // Remove document mousedown listener when popup is hidden
      if (this.boundHandleDocumentMousedown) {
        document.removeEventListener('mousedown', this.boundHandleDocumentMousedown, true);
      }
    }
  }

  showTokenInfo(nodeId: string, data: { poolCount: number, address: string }, clickEvent?: { x: number, y: number }) {
    if (!this.network) return;

    // Clear any existing timeout for node tooltips
    if (this.activeTimeout) {
      clearTimeout(this.activeTimeout);
      this.activeTimeout = null;
    }

    // Format address for display
    const address = data.address || '';
    const firstByte = address.slice(0, 2) === '0x' ? address.slice(2, 6) : address.slice(0, 4);
    const lastByte = address.slice(-4);
    const shortAddress = address && firstByte && lastByte
      ? `0x${firstByte}...${lastByte}`
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

  updateData(newNodesData: any[], newEdgesData: any[]) {
    if (!this.nodesDataset || !this.edgesDataset || !this.network) return;

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
        // Edge exists, prepare for update.
        // TODO: Add diffing if only specific property changes should trigger an update.
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

  destroy() {
    // Clean up popups
    this.hidePopup(); // This will also remove the document listener if active for node popup
    this.hideEdgeInfoPopover(); // Clean up edge popup

    if (this.network) {
      this.network.destroy();
      this.network = null;
    }
    this.nodesDataset = null;
    this.edgesDataset = null;
    this.initialized = false;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  // Method to display information for a clicked edge
  private showEdgeInfoPopover(poolId: string, clickX: number, clickY: number) {
    if (!this.network || !this.container || !this.rawPoolsData) return;

    const pool = this.rawPoolsData[poolId];
    if (!pool) {
      console.warn(`Pool data not found for ID: ${poolId}`);
      return;
    }

    // Clean up any existing edge popover first
    this.hideEdgeInfoPopover();

    const poolAddress = pool.id; // Define poolAddress, which is the pool.id
    const protocolName = pool.protocol_system;
    const lastUpdateBlockNumber = pool.lastUpdatedAtBlock;
    const feeRatePercent = parsePoolFee(pool); // Uses the imported function
    const formattedFee = `${feeRatePercent.toFixed(4)}%`; // Adjust precision as needed
    
    // Use getExternalLink, fallback to Etherscan
    const poolLink = getExternalLink(pool) || `https://etherscan.io/address/${poolAddress}`;
    const displayPoolId = renderHexId(pool.id);
    const fullPoolIdToCopy = pool.id; // For the copy button

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
        min-width: 240px; /* Adjusted min-width */
        pointer-events: auto; /* Allow clicks on links inside */
      ">
      <div style="margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="color: rgba(255, 244, 224, 0.64);">Pool ID: </span>
          <a href="${poolLink}" target="_blank" rel="noopener noreferrer"
             style="color: rgba(255, 244, 224, 0.64); text-decoration: underline; word-break: break-all;">
            ${displayPoolId}
          </a>
        </div>
        <button id="copy-edge-pool-id-button" 
                data-pool-id-to-copy="${fullPoolIdToCopy}"
                style="margin-left: 8px; padding: 2px 6px; font-size: 10px; color: rgba(255, 244, 224, 0.64); background-color: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 244, 224, 0.2); border-radius: 4px; cursor: pointer;">
          Copy
        </button>
      </div>
        <div style="margin-bottom: 8px;">
          <span style="color: rgba(255, 244, 224, 0.64);">Protocol: </span>
          <span style="color: #FFF4E0;">${protocolName}</span>
        </div>
        <div style="margin-bottom: 8px;">
          <span style="color: rgba(255, 244, 224, 0.64);">Fee: </span>
          <span style="color: #FFF4E0;">${formattedFee}</span>
        </div>
        <div>
          <span style="color: rgba(255, 244, 224, 0.64);">Last Block Update: </span>
          <span style="color: #FFF4E0;">${lastUpdateBlockNumber ? lastUpdateBlockNumber : "None"}</span>
        </div>
      </div>
    `;

    const popoverDiv = document.createElement('div');
    popoverDiv.style.position = 'fixed';
    popoverDiv.style.zIndex = '1001'; // Ensure it's above node tooltips if any overlap
    popoverDiv.innerHTML = content;

    // Add event listener for the new copy button in the edge popover
    const copyEdgeButton = popoverDiv.querySelector('#copy-edge-pool-id-button');
    if (copyEdgeButton) {
      copyEdgeButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent graph click event
        const idToCopy = copyEdgeButton.getAttribute('data-pool-id-to-copy');
        if (idToCopy) {
          navigator.clipboard.writeText(idToCopy)
            .then(() => {
              copyEdgeButton.textContent = 'Copied!';
              setTimeout(() => { 
                if (copyEdgeButton) copyEdgeButton.textContent = 'Copy';
              }, 1500);
            })
            .catch(err => console.error('Failed to copy pool ID: ', err));
        }
      });
    }
    
    // Stop propagation for clicks inside the popover itself
    popoverDiv.addEventListener('click', (e) => e.stopPropagation());
    popoverDiv.addEventListener('mousedown', (e) => e.stopPropagation()); // Also for mousedown

    document.body.appendChild(popoverDiv);
    this.currentEdgePopover = { element: popoverDiv, poolId: poolId };

    // Position the popup
    const popupHeight = popoverDiv.offsetHeight;
    const popupWidth = popoverDiv.offsetWidth;
    
    // Position relative to the click, similar to node tooltips
    // Adjustments might be needed based on where the edge click is registered
    let left = clickX - (popupWidth / 2);
    let top = clickY - popupHeight - 20; // 20px above the click

    // Boundary checks (simple version)
    if (left < 0) left = 0;
    if (top < 0) top = 0;
    if (left + popupWidth > window.innerWidth) left = window.innerWidth - popupWidth;
    if (top + popupHeight > window.innerHeight) top = window.innerHeight - popupHeight;

    popoverDiv.style.left = `${left}px`;
    popoverDiv.style.top = `${top}px`;
    popoverDiv.style.display = 'block';

    // Ensure document mousedown listener is active for outside clicks
    if (this.boundHandleDocumentMousedown && !this.popupDiv && !this.currentEdgePopover?.element.parentNode) { // Logic might need refinement
        // This check is tricky. The listener should be active if ANY popup is shown.
        // The existing handleDocumentMousedown should handle both.
        // Let's assume showPopup and this method ensure the listener is active.
        // If not already added by showPopup (node tooltip), add it.
        // This part of the logic for adding/removing the listener needs to be robust.
        // For now, we rely on showPopup to manage the main listener if a node tooltip is also involved.
        // If only an edge popover is shown, we might need to explicitly add it here.
        // The current `handleDocumentMousedown` is designed to hide both.
    }
     if (this.boundHandleDocumentMousedown) {
      // Remove first to avoid duplicates, then add.
      // This ensures it's active if this is the only popup.
      document.removeEventListener('mousedown', this.boundHandleDocumentMousedown, true);
      document.addEventListener('mousedown', this.boundHandleDocumentMousedown, true);
    }
  }

  // Method to hide the edge information popover
  private hideEdgeInfoPopover() {
    if (this.currentEdgePopover) {
      if (this.currentEdgePopover.element.parentNode) {
        this.currentEdgePopover.element.parentNode.removeChild(this.currentEdgePopover.element);
      }
      this.currentEdgePopover = null;
    }
  }
} // End of GraphManager class

// Main component
const GraphView: React.FC<GraphViewProps> = ({ tokenNodes, poolEdges, rawPoolsData }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphManagerRef = useRef<GraphManager | null>(null);

  // Initialize graph only once
  useEffect(() => {
    if (!graphManagerRef.current) {
      graphManagerRef.current = new GraphManager();
    }

    if (containerRef.current) {
      const manager = graphManagerRef.current;
      if (!manager.isInitialized() && tokenNodes.length > 0 && poolEdges.length > 0) {
        manager.initialize(containerRef.current, tokenNodes, poolEdges, rawPoolsData);
      }
    }

    // Only clean up on unmount
    return () => {
      if (graphManagerRef.current) {
        graphManagerRef.current.destroy();
        graphManagerRef.current = null;
      }
    };
  }, []); // Empty dependency array = only run on mount/unmount

  // Handle updates to nodes, edges, or rawPoolsData
  useEffect(() => {
    if (containerRef.current && graphManagerRef.current && graphManagerRef.current.isInitialized()) {
      const manager = graphManagerRef.current;
      // Pass rawPoolsData to updateData if it needs to be updated,
      // or ensure manager.rawPoolsData is updated if it changes.
      // Ensure the manager's internal rawPoolsData is correctly typed and updated
    manager.rawPoolsData = rawPoolsData as Record<string, PoolType>; 
    manager.updateData(tokenNodes, poolEdges);
    manager.refreshCurrentTooltipData(); // Refresh tooltip if open
  }
  }, [tokenNodes, poolEdges, rawPoolsData]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />; {/* Removed border */ }
};

export default GraphView;
