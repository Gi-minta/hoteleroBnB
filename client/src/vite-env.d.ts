/// <reference types="vite/client" />

interface ImportMetaEnv {
  // URL base de la API. En dev queda vacía y Axios usa "/api" (proxy de Vite).
  // En GitHub Pages se define en el build (variable de repo VITE_API_URL) para
  // apuntar al backend público.
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
