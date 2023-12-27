import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), crx({ manifest })],
  resolve: {
    alias: [
      {
        find: './runtimeConfig',
        replacement: './runtimeConfig.browser', // ensures browser compatible version of AWS JS SDK is used
      },
    ]
  }
})
