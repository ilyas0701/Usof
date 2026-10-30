import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const apiEnv = loadEnv(
    mode,
    fileURLToPath(new URL('./API/', import.meta.url)),
    ['APP_URL', 'PORT'],
  )
  const apiTarget = apiEnv.APP_URL || `http://localhost:${apiEnv.PORT || 3000}`

  const proxy = {
    '/uploads': {
      target: apiTarget,
      changeOrigin: true,
    },
    '/api': {
      target: apiTarget,
      changeOrigin: true,
    },
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: { proxy },
    preview: { proxy },
  }
})
