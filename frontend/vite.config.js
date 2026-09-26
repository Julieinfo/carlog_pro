import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // En local et sur Replit, le frontend relaie /api vers Express.
  // Cela evite de coder une URL publique inconnue et limite aussi les soucis de CORS.
  server: {
    host: '0.0.0.0',
    port: Number(process.env.VITE_PORT) || 5173,
    strictPort: false,
    proxy: {
      '/api': 'http://127.0.0.1:5000',
    },
  },
});