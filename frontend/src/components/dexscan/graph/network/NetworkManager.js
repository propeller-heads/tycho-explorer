import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { updateNetworkData } from '@/components/dexscan/graph/network/NetworkUpdater';
import { getDefaultNetworkOptions } from '@/components/dexscan/graph/network/defaultNetworkOptions';

/**
 * Manages vis-network instance
 */
export class NetworkManager {
  constructor() {
    this.network = null;
    this.nodesDataset = null;
    this.edgesDataset = null;
  }

  getNetwork() { return this.network; }
  getNodesDataset() { return this.nodesDataset; }
  getEdgesDataset() { return this.edgesDataset; }

  initialize(container, nodes, edges, options = {}) {
    this.nodesDataset = new DataSet(nodes);
    this.edgesDataset = new DataSet(edges);
    
    const finalOptions = { ...getDefaultNetworkOptions(), ...options };
    
    this.network = new Network(
      container,
      { nodes: this.nodesDataset, edges: this.edgesDataset },
      finalOptions
    );
  }

  updateData(nodes, edges) {
    updateNetworkData(
      this.network,
      this.nodesDataset,
      this.edgesDataset,
      nodes,
      edges
    );
  }

  destroy() {
    if (this.network) this.network.destroy();
    this.network = null;
    this.nodesDataset = null;
    this.edgesDataset = null;
  }
}