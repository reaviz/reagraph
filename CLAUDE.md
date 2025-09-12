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

## Coding Rules and Conventions

### TypeScript Patterns
- All component props interfaces end with `Props` suffix (e.g., `NodeProps`, `EdgeProps`, `GraphCanvasProps`)
- Use `FC<Props>` type for functional components
- Destructure props with default values in parameter list: `draggable = false`
- Export types and interfaces alongside components for external consumption
- Use `InternalGraph*` prefix for internal data structures (e.g., `InternalGraphNode`, `InternalGraphEdge`)

### Component Structure
- Components are organized by feature in dedicated directories with `index.ts` barrel exports
- Each directory exports all public APIs via `export * from './ComponentName'` pattern
- Component files follow PascalCase naming (e.g., `GraphCanvas.tsx`, `RadialMenu.tsx`)
- Hook files use camelCase with `use` prefix (e.g., `useGraph.ts`, `useEdgeEvents.ts`)

### React Three Fiber Integration
- Access Three.js context via `useThree()` hook for camera, raycaster, size, gl
- Handle Three.js events with `ThreeEvent<MouseEvent>` or `ThreeEvent<PointerEvent>` types

### State Management with Zustand
- Global state managed through single Zustand store in `store.ts`
- Use context pattern with `createStore()` factory and `Provider` component  
- Access state via custom `useStore()` hook with `useShallow()` for performance
- State mutations follow immutable patterns with spread operators
- Transient state stored in refs for drag operations (`dragRef.current`)

### Animation Patterns
- Use `@react-spring/three` for all animations with consistent `animationConfig`
- Position animations use arrays: `[x, y, z]` format
- Scale animations prevent zero values: `[0.00001, 0.00001, 0.00001]`

### Event Handling
- Use custom hooks for complex event logic (e.g., `useEdgeEvents`, `useHoverIntent`)
- Memoize event handlers with `useCallback()` and store in refs for performance
- Implement hover intent patterns to prevent accidental triggers
- Use gesture library (`@use-gesture/react`) for drag interactions with threshold
- Guard event handlers with `disabled` checks

### Performance Optimizations  
- Extensive use of `useMemo()` for expensive calculations and object creation
- `useCallback()` for event handlers and functions passed as props
- Store frequently accessed state in refs to avoid re-renders during drag operations
- Batch state updates and use shallow comparison for state selection

### Testing Conventions
- Use Vitest with `describe()` and `test()` functions
- Test files use `.test.ts` suffix
- Import testing utilities: `import { expect, test, describe } from 'vitest'`
- Test mathematical utilities and business logic, not UI components
- Focus on edge cases and boundary conditions

### Import Organization
- React imports first, then Three.js, then internal imports
- Group imports by: React/libs, Three.js types, internal stores/hooks, internal types
- Use relative imports for internal modules
- Destructure commonly used items from stores and hooks

### File Structure Rules
- Each feature has dedicated folder with `index.ts` barrel export
- Utility functions grouped by domain (layout, geometry, animation, etc.)
- Custom hooks start with `use` and contain complex stateful logic

## Key Dependencies
- React Three Fiber - React renderer for Three.js
- Three.js - WebGL 3D graphics  
- Graphology - Graph data structure and algorithms
- D3 modules - Layout calculations and data manipulation
- Zustand - State management
- React Spring - Animation library
