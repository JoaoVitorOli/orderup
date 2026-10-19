import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The API has no CORS setup yet, so in dev the browser calls /api on Vite's
// own origin and Vite forwards it to the Nest API.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.API_URL ?? 'http://localhost:3000',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // Socket.IO starts over HTTP and then upgrades to a WebSocket;
      // `ws: true` forwards that upgrade too.
      '/socket.io': {
        target: process.env.API_URL ?? 'http://localhost:3000',
        ws: true,
      },
    },
  },
});
