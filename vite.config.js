import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
