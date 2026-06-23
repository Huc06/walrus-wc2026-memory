/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Walrus mainnet aggregator base URL (public reads). Optional override. */
  readonly VITE_WALRUS_AGGREGATOR?: string
  /** Walrus publisher base URL for writes (your own / authenticated relay). */
  readonly VITE_WALRUS_PUBLISHER?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
