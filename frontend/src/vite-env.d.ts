/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEBSOCKET_URL: string
  readonly VITE_WEBSOCKET_URL_ETHEREUM: string
  readonly VITE_WEBSOCKET_URL_BASE: string
  readonly VITE_WEBSOCKET_URL_UNICHAIN: string
  readonly VITE_API_ETHEREUM_URL: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_UNICHAIN_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
