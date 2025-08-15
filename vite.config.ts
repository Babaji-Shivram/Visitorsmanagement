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
      // Proxy specific controller routes to the ASP.NET Core API
      '/auth': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/visitors': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/staff': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/locations': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/email-actions': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/settings': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/roleconfiguration': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
