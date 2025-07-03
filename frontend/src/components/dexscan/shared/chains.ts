// Log environment variables for debugging
console.warn('🔷 [ENV] Loading chain configuration...');
console.warn('🔷 [ENV] VITE_WEBSOCKET_URL_ETHEREUM:', import.meta.env.VITE_WEBSOCKET_URL_ETHEREUM);
console.warn('🔷 [ENV] VITE_WEBSOCKET_URL_BASE:', import.meta.env.VITE_WEBSOCKET_URL_BASE);
console.warn('🔷 [ENV] VITE_WEBSOCKET_URL_UNICHAIN:', import.meta.env.VITE_WEBSOCKET_URL_UNICHAIN);

export const CHAIN_CONFIG = {
  Ethereum: {
    name: 'Ethereum',
    wsUrl: import.meta.env.VITE_WEBSOCKET_URL_ETHEREUM,
    enabled: true
  },
  Base: {
    name: 'Base',
    wsUrl: import.meta.env.VITE_WEBSOCKET_URL_BASE,
    enabled: true
  },
  Unichain: {
    name: 'Unichain',
    wsUrl: import.meta.env.VITE_WEBSOCKET_URL_UNICHAIN,
    enabled: true
  }
};