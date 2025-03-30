import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    // host: true,
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'trello-test-t.netlify.app/'
    ],
    cors: true,
  }
})
