import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json' // Correct import
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), crx({ manifest })], // Pass the manifest object
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
  },
  server: {
    port: 8000,
  },
  build: {
    // generate .vite/manifest.json in outDir
    manifest: true, // Enable Vite to generate manifest.json
  }
})
