import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import process from 'node:process'

export default defineConfig(({ mode }) => {
  const apiTarget = loadEnv(mode, process.cwd(), "").VITE_API_PROXY_TARGET

  return {
    plugins: [react(), tailwindcss()],
    base: '/',
    server: apiTarget
      ? {
          proxy: {
            '/api': {
              target: apiTarget,
              changeOrigin: true,
            },
          },
        }
      : undefined,
  }
})