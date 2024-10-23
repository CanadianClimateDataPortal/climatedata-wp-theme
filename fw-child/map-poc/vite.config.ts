import path from "path";
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/wp-content/themes/fw-child/map-poc/dist/' : '/map-poc/', // Adjust the production base URL
  build: {
    manifest: true,
    assetsDir: '.',
    outDir: 'dist', // Directory for build output relative to the config file
    emptyOutDir: true, // Empties the outDir on build
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
