import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import path from 'path' // Change this line

const viteManifestHackIssue846 = {
    // Workaround from https://github.com/crxjs/chrome-extension-tools/issues/846#issuecomment-1861880919.
    name: 'manifestHackIssue846',
    renderCrxManifest(_manifest: any, bundle: any) {
        bundle['manifest.json'] = bundle['.vite/manifest.json']
        bundle['manifest.json'].fileName = 'manifest.json'
        delete bundle['.vite/manifest.json']
    },
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteManifestHackIssue846, crx({ manifest: manifest as any })],
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
  build: {
    // generate .vite/manifest.json in outDir
    manifest: true,
  }
})
