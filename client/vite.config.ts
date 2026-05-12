import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:3069',
      '/pm2': 'http://localhost:3069',
      '/socket.io': { target: 'http://localhost:3069', ws: true },
    },
  },
});
