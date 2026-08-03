import path from "path"
import { fileURLToPath } from "url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  // En build usamos el subdirectorio de GitHub Pages (configurable con VITE_BASE);
  // en dev/preview siempre "/" para no romper el servidor local.
  base: command === "build" ? (process.env.VITE_BASE ?? "/hoteleroBnB/") : "/",
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  server: {
    port: 4200,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      // Archivos subidos (fotos de documentos, etc.) los sirve el backend.
      "/uploads": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
}))
