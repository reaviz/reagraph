# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Reagraph is a high-performance WebGL network graph visualization library for React. It provides interactive graph rendering using Three.js and React Three Fiber with support for 2D/3D layouts, node clustering, edge bundling, and various interaction modes.

## Development Commands

### Core Development
- `npm start` - Start Storybook development server on port 9009
- `npm run build` - Build library and documentation
- `npm test` - Run tests with Vitest
- `npm run test:coverage` - Run tests with coverage

### Code Quality
- `npm run lint` - Run ESLint on TypeScript files
- `npm run lint:fix` - Fix ESLint issues automatically  
- `npm run prettier` - Format code with Prettier

### Documentation
- `npm run build-storybook` - Build Storybook for production
- `npm run build:docs` - Generate documentation files

## Architecture

### Core Components
- **GraphCanvas** (`src/GraphCanvas/`) - Main component wrapping React Three Fiber Canvas
- **GraphScene** (`src/GraphScene.tsx`) - Core 3D scene management and rendering logic
- **Layout System** (`src/layout/`) - Multiple graph layout algorithms (force-directed, circular, hierarchical, etc.)
- **Symbol System** (`src/symbols/`) - Renderable graph elements (nodes, edges, clusters, labels)
- **Store** (`src/store.ts`) - Zustand-based state management for graph interactions

### Key Systems
- **Layout Providers** (`src/layout/layoutProvider.ts`) - Abstraction for different layout algorithms
- **Node Sizing** (`src/sizing/`) - Dynamic node sizing based on attributes, centrality, or PageRank
- **Camera Controls** (`src/CameraControls/`) - 3D camera interaction and navigation
- **Selection System** (`src/selection/`) - Node selection with lasso and click interactions
- **Theming** (`src/themes/`) - Light/dark themes and customizable styling

### Data Flow
1. Graph data (nodes/edges) flows through layout algorithms
2. Positioned graph elements are rendered as Three.js objects
3. User interactions are handled via React Three Fiber event system
4. State updates trigger re-renders through Zustand store

### Testing
- Uses Vitest with jsdom environment
- Test files use `.test.ts` suffix
- Coverage reports available via `npm run test:coverage`

### Build System
- Vite with TypeScript for both library and development builds
- Dual build modes: library (for publishing) and development (for Storybook)
- CSS modules for component styles
- SVG imports via vite-plugin-svgr

## Key Dependencies
- React Three Fiber - React renderer for Three.js
- Three.js - WebGL 3D graphics
- Graphology - Graph data structure and algorithms
- D3 modules - Layout calculations and data manipulation
- Zustand - State management