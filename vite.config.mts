/// <reference types="vitest/config" />

import packageJson from './package.json' with { type: 'json'};
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
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

// Browser global names for the UMD build's externals (silences Rolldown's
// MISSING_GLOBAL_NAME check). Canonical names where the dependency actually
// ships a browser global (React, THREE, d3, CameraControls, classNames);
// best-effort names elsewhere — the UMD entry is primarily consumed via
// require(), where these names are unused.
const umdGlobals: Record<string, string> = {
  '@react-spring/three': 'ReactSpringThree',
  '@react-three/drei': 'ReactThreeDrei',
  '@react-three/fiber': 'ReactThreeFiber',
  '@use-gesture/react': 'UseGestureReact',
  'camera-controls': 'CameraControls',
  classnames: 'classNames',
  'd3-force-3d': 'd3',
  'd3-hierarchy': 'd3',
  'd3-scale': 'd3',
  ellipsize: 'ellipsize',
  graphology: 'graphology',
  'graphology-layout-forceatlas2': 'graphologyLayoutForceAtlas2',
  'graphology-layout-noverlap': 'graphologyLayoutNoverlap',
  'graphology-layout/circular.js': 'graphologyLayoutCircular',
  'graphology-layout/random.js': 'graphologyLayoutRandom',
  'graphology-metrics/centrality/degree.js': 'graphologyMetricsCentralityDegree',
  'graphology-metrics/centrality/pagerank.js': 'graphologyMetricsCentralityPagerank',
  'graphology-shortest-path': 'graphologyShortestPath',
  'hold-event': 'holdEvent',
  react: 'React',
  'react-dom': 'ReactDOM',
  'react/jsx-runtime': 'ReactJSXRuntime',
  three: 'THREE',
  'three-stdlib': 'ThreeStdlib',
  zustand: 'zustand',
  'zustand/shallow': 'zustandShallow'
};

export default defineConfig(({ mode }) =>
  mode === 'library'
    ? {
      plugins: [
        svgrPlugin(),
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
        rolldownOptions: {
          external: externalDeps,
          output: {
            globals: umdGlobals
          }
        }
      }
    }
    : {
      plugins: [
        svgrPlugin(),
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
