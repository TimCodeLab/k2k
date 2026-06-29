import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward API calls to the Cloudflare Worker during local dev.
      '/api': 'http://localhost:8787',
      '/media': 'http://localhost:8787',
    },
  },
});
