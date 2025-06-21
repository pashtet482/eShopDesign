import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/products': 'http://localhost:8080',
      '/categories': 'http://localhost:8080',
      '/users': 'http://localhost:8080',
      '/orders': 'http://localhost:8080',
    }
  }
})
