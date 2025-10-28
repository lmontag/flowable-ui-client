// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        // Flowable REST dev proxy (optional): enable during local development to avoid CORS issues
        proxy: {
            // intercepts EVERYTHING that starts with /flowable-rest
            '/flowable-rest': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
                // (optional) timeout or logLevel if you need debugging
                // logLevel: 'debug',
            },
        },
    },
})
