import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    // Inlines all CSS into the JS bundle – no separate .css file
    cssInjectedByJsPlugin(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'src/main.tsx'),
      output: {
        // Single self-executing bundle — upload this to Shopify Assets
        entryFileNames: 'customizer-bundle.js',
        // Inline any code-split chunks so there is only one file
        inlineDynamicImports: true,
        format: 'iife',
        name: 'DamiCustomizer',
      },
    },
    // Don't split CSS — cssInjectedByJsPlugin handles injection
    cssCodeSplit: false,
    outDir: 'dist',
    emptyOutDir: true,
    // Fabric.js makes this a large bundle by design; suppress noise
    chunkSizeWarningLimit: 800,
  },
})
