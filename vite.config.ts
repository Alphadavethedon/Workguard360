import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'], // Keep existing exclude
  },
  build: {
    rollupOptions: {
      // Do not externalize @tanstack/react-query unless explicitly needed
    }
  }
});
