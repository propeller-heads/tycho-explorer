import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  preview: {
    host: "0.0.0.0",
    port: 8080,
  },
  plugins: [
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  esbuild: {
    loader: 'tsx',
    include: /\.(jsx?|tsx?)$/,
    exclude: [],
  },
  build: {
    // Production optimizations
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: false }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Generate source maps for production debugging if needed
    sourcemap: false,
    // Target modern browsers
    target: 'es2020',
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'vis-network', 'vis-data'],
  },
}));
