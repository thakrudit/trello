import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  // server: {
  //   // host: true,
  //   host: '127.0.0.1',
  //   port: 5173,
  //   strictPort: true,
  //   allowedHosts: [
  //     '9042-2401-4900-1c6f-48b9-6d7c-dbe2-12cc-bac1.ngrok-free.app'
  //   ],
  //   cors: true,
  // }
})
