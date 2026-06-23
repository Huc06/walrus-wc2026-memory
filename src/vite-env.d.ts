/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Walrus mainnet aggregator base URL (public reads). Optional override. */
  readonly VITE_WALRUS_AGGREGATOR?: string
  /** Walrus publisher base URL for writes (your own / authenticated relay). */
  readonly VITE_WALRUS_PUBLISHER?: string
  /** Marketing landing page URL (the app header links back to it). */
  readonly VITE_LANDING_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
