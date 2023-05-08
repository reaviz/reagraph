/// <reference types="vitest" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import checker from 'vite-plugin-checker';

export default defineConfig({
  plugins: [
    svgrPlugin(),
    tsconfigPaths(),
    react(),
    checker({
      typescript: true
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom'
  }
});
