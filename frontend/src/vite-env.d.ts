/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEBSOCKET_URL: string
  readonly VITE_WEBSOCKET_URL_ETHEREUM: string
  readonly VITE_WEBSOCKET_URL_BASE: string
  readonly VITE_WEBSOCKET_URL_UNICHAIN: string
  // Add more env variables here as needed
  // readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
