import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

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
    host: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // Fix reagraph import resolution for local development
      'reagraph': resolve(__dirname, '../dist/main.mjs')
    }
  },
  optimizeDeps: {
    // Exclude reagraph from pre-bundling since it's a local file dependency
    exclude: ['reagraph'],
    // Force include these dependencies that reagraph needs
    include: ['react', 'react-dom', 'three', '@react-three/fiber']
  }
});