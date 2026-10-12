import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all local IP addresses (0.0.0.0) for mobile QR code access
    port: 3000,
    open: false,
    allowedHosts: true, // Allow all public tunnel domains, ngrok, and Cloudflare
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
