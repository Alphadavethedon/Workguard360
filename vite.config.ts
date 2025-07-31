import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Add aliases if needed (e.g., for absolute imports)
      // '@': resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'], // Exclude lucide-react as before
    include: ['@tanstack/react-query'], // Force inclusion to avoid resolution issues
  },
  build: {
    rollupOptions: {
      external: [], // Explicitly empty to avoid unintended externalization
      output: {
        manualChunks(id) {
          // Optional: Customize chunking if needed
          if (id.includes('node_modules')) {
            return 'vendor'; // Group node_modules into a single chunk
          }
        },
      },
    },
    target: 'esnext', // Ensure compatibility with modern browsers
    minify: 'esbuild', // Use esbuild for faster minification
  },
  server: {
    port: 5000, // Default port for local dev
    open: true, // Auto-open browser on dev
  },
});
