import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.PAGES_BASE_PATH || '/',
  server: { host: '127.0.0.1', strictPort: true },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  build: { sourcemap: false, target: 'es2022' },
})
