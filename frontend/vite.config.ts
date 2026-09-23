import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // `host` évite un bind IPv6-loopback seul, injoignable depuis un autre poste ou un conteneur.
  server: {
    host: true,
    // Les appels `/api/v1` sont relayés vers Spring Boot : même origine, donc aucun CORS en dev.
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // Le relais est serveur-à-serveur : sans Origin, Spring Security n'applique pas
        // sa liste CORS et l'accès depuis une autre machine (LAN, conteneur) fonctionne.
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => proxyReq.removeHeader('origin'))
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
})
