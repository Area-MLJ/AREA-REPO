import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8081,
    host: true,
    allowedHosts: ['app.jodicenter.com']
  },
  preview: {
    port: 8081,
    host: true,
    allowedHosts: ['app.jodicenter.com']
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('../../shared', import.meta.url))
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
