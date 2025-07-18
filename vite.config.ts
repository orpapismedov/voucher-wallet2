import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Temporarily removing base path to debug deployment issue
  // base: '/voucher-wallet2/',
})
