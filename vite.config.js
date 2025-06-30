import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/products': 'http://b438c344c53a.vps.myjino.ru',
      '/categories': 'http://b438c344c53a.vps.myjino.ru',
      '/users': 'http://b438c344c53a.vps.myjino.ru',
      '/api/orders': 'http://b438c344c53a.vps.myjino.ru',
    }
  }
})
