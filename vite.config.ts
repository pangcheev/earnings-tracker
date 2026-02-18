import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      cert: fs.readFileSync('cert.pem'),
      key: fs.readFileSync('key.pem'),
    },
    host: '0.0.0.0',
    port: 5173,
  },
})
