/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OVERVIEW_DATA_MODE?: 'mock' | 'live'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

