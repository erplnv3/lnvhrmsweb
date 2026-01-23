import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    react(),
    // basicSsl()   // 🔐 HTTPS enable
  ],
  server: {
    host: true,   // 🌐 Network ON
    port: 3000,
    // https: true   // ⭐ Safari requirement
  }
})
