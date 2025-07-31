import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // '@': resolve(__dirname, 'src'), // Uncomment if using absolute imports
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['@tanstack/react-query'], // Ensure this is included
  },
  build: {
    rollupOptions: {
      external: [], // Explicitly empty to avoid unintended externalization
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'; // Group node_modules into a single chunk
          }
        },
      },
    },
    target: 'esnext',
    minify: 'esbuild',
  },
  server: {
    port: 5000,
    open: true,
  },
});
