import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  publicDir: '../dami-customizer-raw/public',
  server: { port: 5174 },
})
