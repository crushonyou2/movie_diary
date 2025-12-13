import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/movie_diary/',
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // 여기를 로컬 주소로 변경!
        changeOrigin: true,
        secure: false,
      },
    },
  },
})