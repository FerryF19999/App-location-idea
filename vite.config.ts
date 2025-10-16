import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const geminiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || env.API_KEY || '';
    const mapsKey = env.GOOGLE_MAPS_API_KEY || env.VITE_GOOGLE_MAPS_API_KEY || env.API_KEY || '';
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.API_KEY || geminiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
        'process.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || geminiKey),
        'process.env.GOOGLE_MAPS_API_KEY': JSON.stringify(mapsKey),
        'process.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(env.VITE_GOOGLE_MAPS_API_KEY || mapsKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
