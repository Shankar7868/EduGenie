import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api/webhook': {
        target: 'http://18.61.252.168/webhook',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/webhook/, '')
      }
    }
  }
})
