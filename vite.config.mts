/// <reference types="vitest" />

import packageJson from './package.json' with { type: 'json'};
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import checker from 'vite-plugin-checker';
import { resolve } from 'node:path';
import dts from 'vite-plugin-dts';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

const externalDeps: RegExp[] = [];

for (const peerDep in packageJson.peerDependencies) {
  externalDeps.push(new RegExp(`${peerDep}(/.*)?$`))
}

for (const dep in packageJson.dependencies) {
  externalDeps.push(new RegExp(`${dep}(/.*)?$`))
}

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
          entry: resolve('src', 'index.ts'),
          name: 'reagraph',
          fileName: 'index'
        },
        rollupOptions: {
          external: externalDeps,
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
