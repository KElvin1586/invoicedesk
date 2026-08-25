import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // GitHub Pages serves this project site from /pocketledger/
  base: '/pocketledger/',
  plugins: [react(), tailwindcss()],
  preview: {
    allowedHosts: [
      'work-1-lioohljgrvevafpn.prod-runtime.all-hands.dev',
      'work-2-lioohljgrvevafpn.prod-runtime.all-hands.dev',
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'dexie'],
          charts: ['recharts'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
});
