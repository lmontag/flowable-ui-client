// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    /*
     * Optional: Flowable REST dev proxy
     * Uncomment this block only if you get CORS issues
     * when connecting to a Flowable REST API running on a different origin.
     */
    // proxy: {
    //   '/flowable-rest': {
    //     target: 'http://localhost:8080',
    //     changeOrigin: true,
    //     secure: false,
    //   },
    // },
  },
})
