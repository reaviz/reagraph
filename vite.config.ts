/// <reference types="vitest" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import checker from 'vite-plugin-checker';
import { resolve } from 'path';
import external from 'rollup-plugin-peer-deps-external';
import dts from 'vite-plugin-dts';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig(({ mode }) =>
  mode === 'library'
    ? {
      plugins: [
        svgrPlugin(),
        tsconfigPaths(),
        cssInjectedByJsPlugin(),
        react(),
        dts({
          insertTypesEntry: true,
          include: ['src']
        }),
        checker({
          typescript: true
        })
      ],
      test: {
        globals: true,
        environment: 'jsdom'
      },
      build: {
        minify: false,
        sourcemap: true,
        copyPublicDir: false,
        lib: {
          entry: {
            index: resolve('src', 'index.ts'),
            'hooks/index': resolve('src', 'hooks/index.ts'),
            'symbols/index': resolve('src', 'symbols/index.ts')
          },
          name: 'reagraph',
          formats: ['es', 'cjs'],
          fileName: (format, entryName) => {
            const ext = format === 'es' ? 'js' : 'cjs';
            return `${entryName}.${ext}`;
          }
        },
        rollupOptions: {
          plugins: [
            external({
              includeDependencies: true
            })
          ],
          output: {
            preserveModules: false,
            exports: 'named'
          }
        }
      }
    }
    : {
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
    }
);
