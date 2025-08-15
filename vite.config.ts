import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      // Proxy any calls starting with /api to the local ASP.NET Core API
      '/api': {
        target: 'http://localhost:5014',
        changeOrigin: true,
        secure: false,
        // keep the /api prefix so the frontend can call /api/... and the API sees /api/...
        rewrite: (path) => path
      },
    },
  },
});
