import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { visitsHandler } from './server/visits.js'

// Same /api/visits endpoint as server/index.js, so the footer counter works in `npm run dev` and `vite preview`
const visitsApi = () => ({
  name: 'autoev-visits-api',
  configureServer(server) {
    server.middlewares.use('/api/visits', visitsHandler)
  },
  configurePreviewServer(server) {
    server.middlewares.use('/api/visits', visitsHandler)
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), visitsApi()],
  // Inline config stops Vite from picking up a postcss.config.* in a parent folder
  css: { postcss: {} },
})
