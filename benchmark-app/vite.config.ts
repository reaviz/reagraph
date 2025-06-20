import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    minify: false, // Disable minification for easier performance debugging
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          reagraph: ['reagraph']
        }
      }
    }
  },
  worker: {
    format: 'es'
  },
  server: {
    port: 3001, // Different from Storybook to avoid conflicts
    host: true
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});