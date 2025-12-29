# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Reagraph is a high-performance WebGL network graph visualization library for React (v4.30.7+). It provides interactive graph rendering using Three.js and React Three Fiber with support for 2D/3D layouts, node clustering, edge bundling, and various interaction modes.

**Repository:** https://github.com/reaviz/reagraph
**License:** Apache-2.0

## Development Commands

### Core Development
- `npm start` - Start Storybook development server on port 9009
- `npm run build` - Build library and documentation (`vite build --mode library && npm run build:docs`)
- `npm test` - Run tests with Vitest
- `npm run test:coverage` - Run tests with coverage

### Code Quality
- `npm run lint` - Run ESLint on TypeScript files
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run prettier` - Format code with Prettier

### Documentation
- `npm run build-storybook` - Build Storybook for production
- `npm run build:docs` - Generate documentation files

### Pre-commit
- Uses Husky for git hooks with lint-staged
- ESLint and Prettier run automatically on staged files

## Architecture

### Core Components
- **GraphCanvas** (`src/GraphCanvas/`) - Main component wrapping React Three Fiber Canvas, entry point for the library
- **GraphScene** (`src/GraphScene.tsx`) - Core 3D scene management and rendering logic
- **Layout System** (`src/layout/`) - Multiple graph layout algorithms
- **Symbol System** (`src/symbols/`) - Renderable graph elements (nodes, edges, clusters, labels)
- **Store** (`src/store.ts`) - Zustand-based state management for graph interactions

### Layout Types (src/layout/types.ts)
Available layout algorithms:
- **Force-directed:** `forceDirected2d`, `forceDirected3d`
- **Tree layouts:** `treeTd2d`, `treeTd3d`, `treeLr2d`, `treeLr3d`
- **Radial:** `radialOut2d`, `radialOut3d`
- **Circular:** `circular2d`, `concentric2d`, `concentric3d`
- **Hierarchical:** `hierarchicalTd`, `hierarchicalLr`
- **Specialized:** `nooverlap`, `forceatlas2`, `custom`

### Node Sizing Types (src/sizing/)
- `default` - Fixed size for all nodes
- `attribute` - Size based on node data attribute
- `centrality` - Size based on graph centrality metrics
- `pageRank` - Size based on PageRank algorithm

### Symbol Components (src/symbols/)
- **Nodes:** `Sphere`, `Icon`, `Svg`, `SphereWithIcon`, `SphereWithSvg`, `Badge`
- **Edges:** `Edge`, `Edges`, `SelfLoop` with animation and geometry hooks
- **Clusters:** `Ring` for cluster visualization
- **Labels:** `Label` for node/edge text

### Key Systems
- **Layout Providers** (`src/layout/layoutProvider.ts`) - Factory for layout algorithms
- **Node Sizing** (`src/sizing/nodeSizeProvider.ts`) - Dynamic node sizing strategies
- **Camera Controls** (`src/CameraControls/`) - 3D camera interaction (pan, orbit, orthographic)
- **Selection System** (`src/selection/`) - Node selection with lasso and click interactions
- **Collapse System** (`src/collapse/`) - Node collapsing/expanding functionality
- **Theming** (`src/themes/`) - Light/dark themes and customizable styling
- **Radial Menu** (`src/RadialMenu/`) - Context menu for node interactions

### Data Flow
1. Graph data (`nodes`/`edges`) passed to `GraphCanvas`
2. `useGraph` hook builds graphology graph and runs layout algorithms
3. Layout positions stored in Zustand store
4. Positioned graph elements rendered as Three.js objects via React Three Fiber
5. User interactions handled via R3F event system
6. State updates trigger re-renders through store subscriptions

### Key Hooks
- `useGraph` - Main hook managing graph state, layout, and transformations
- `useStore` - Zustand store access with shallow comparison
- `useCameraControls` / `useCenterGraph` - Camera manipulation
- `useSelection` - Selection state management
- `useCollapse` - Node collapse/expand logic
- `useDrag` - Node dragging with gesture handling
- `useHoverIntent` - Hover detection with intent patterns
- `useEdgeEvents` / `useEdgeAnimations` / `useEdgeGeometry` - Edge-specific hooks

### Testing
- Uses Vitest with jsdom environment
- Test files use `.test.ts` suffix
- Coverage reports available via `npm run test:coverage`
- Tests focus on utilities and business logic (not React components)

### Build System
- Vite with TypeScript (`vite.config.mts`)
- Dual build modes: `library` (for publishing) and `development` (for Storybook)
- CSS modules for component styles (`.module.css`)
- SVG imports via `vite-plugin-svgr`
- Type declarations via `vite-plugin-dts`
- CSS injected by JS via `vite-plugin-css-injected-by-js`

### Storybook
- Stories in `stories/demos/*.story.tsx`
- Uses `@storybook/react-vite` framework
- Configured in `.storybook/main.ts`

## Coding Rules and Conventions

### TypeScript Patterns
- All component props interfaces end with `Props` suffix (e.g., `NodeProps`, `EdgeProps`, `GraphCanvasProps`)
- Use `FC<Props>` type for functional components
- Destructure props with default values in parameter list: `draggable = false`
- Export types and interfaces alongside components for external consumption
- Use `InternalGraph*` prefix for internal data structures (e.g., `InternalGraphNode`, `InternalGraphEdge`)
- Type imports use `import type` syntax

### Component Structure
- Components organized by feature in dedicated directories with `index.ts` barrel exports
- Each directory exports all public APIs via `export * from './ComponentName'` pattern
- Component files follow PascalCase naming (e.g., `GraphCanvas.tsx`, `RadialMenu.tsx`)
- Hook files use camelCase with `use` prefix (e.g., `useGraph.ts`, `useEdgeEvents.ts`)
- Use `forwardRef` for components that expose refs (like `GraphCanvas`)

### React Three Fiber Integration
- Access Three.js context via `useThree()` hook for camera, raycaster, size, gl
- Handle Three.js events with `ThreeEvent<MouseEvent>` or `ThreeEvent<PointerEvent>` types
- Use `@react-three/drei` for helper components
- Mesh `userData` contains `{ id, type: 'node' | 'edge' }` for identification

### State Management with Zustand
- Global state managed through single Zustand store in `store.ts`
- Use context pattern with `createStore()` factory and `Provider` component
- Access state via custom `useStore()` hook with `useShallow()` for performance
- State mutations follow immutable patterns with spread operators
- Transient state stored in refs for drag operations (`dragRef.current`)
- Store handles: nodes, edges, clusters, selections, actives, drags, panning, theme

### Animation Patterns
- Use `@react-spring/three` for all animations with consistent `animationConfig`
- Import animated components: `import { a, useSpring } from '@react-spring/three'`
- Position animations use arrays: `[x, y, z]` format
- Scale animations prevent zero values: `[0.00001, 0.00001, 0.00001]`
- Animation duration set to 0 when `animated` prop is false

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
- Auto-disable animations when node+edge count > 400

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
- Use path aliases from tsconfig (baseUrl: `./src`)
- Destructure commonly used items from stores and hooks

### File Structure Rules
- Each feature has dedicated folder with `index.ts` barrel export
- Utility functions grouped by domain (`utils/geometry.ts`, `utils/animation.ts`, etc.)
- Custom hooks start with `use` and contain complex stateful logic
- Type definitions in `types.ts` files within each module

## Key Types

### Graph Data Types (src/types.ts)
```typescript
// Public types (user-facing)
interface GraphNode {
  id: string;
  label?: string;
  data?: any;
  icon?: string;
  fill?: string;
  cluster?: string;
  fx?: number; fy?: number; fz?: number; // Fixed positions
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  fill?: string;
  dashed?: boolean;
  interpolation?: 'linear' | 'curved';
  arrowPlacement?: 'none' | 'mid' | 'end';
}

// Internal types (with computed properties)
interface InternalGraphNode extends GraphNode {
  position: InternalGraphPosition;
}
```

### Theme Structure (src/themes/theme.ts)
```typescript
interface Theme {
  canvas?: { background?: ColorRepresentation; fog?: ColorRepresentation };
  node: { fill, activeFill, opacity, selectedOpacity, inactiveOpacity, label: {...} };
  edge: { fill, activeFill, opacity, selectedOpacity, inactiveOpacity, label: {...} };
  ring: { fill, activeFill };
  arrow: { fill, activeFill };
  lasso: { background, border };
  cluster?: { stroke, fill, opacity, label: {...} };
}
```

## Key Dependencies
- **Three.js** (`three`, `three-stdlib`) - WebGL 3D graphics
- **React Three Fiber** (`@react-three/fiber`) - React renderer for Three.js
- **Drei** (`@react-three/drei`) - React Three Fiber helpers
- **React Spring** (`@react-spring/three`) - Animation library
- **Graphology** (`graphology`, `graphology-*`) - Graph data structure and algorithms
- **D3 modules** (`d3-array`, `d3-force-3d`, `d3-hierarchy`, `d3-scale`) - Layout calculations
- **Zustand** (`zustand`) - State management
- **Camera Controls** (`camera-controls`) - 3D camera interaction
- **Use Gesture** (`@use-gesture/react`) - Gesture handling

## Common Patterns

### Creating a Custom Node Renderer
```typescript
const CustomNode: FC<NodeRendererProps> = ({ color, size, opacity, animated, id }) => {
  const { scale } = useSpring({
    from: { scale: [0.00001, 0.00001, 0.00001] },
    to: { scale: [size, size, size] },
    config: { ...animationConfig, duration: animated ? undefined : 0 }
  });

  return (
    <a.mesh userData={{ id, type: 'node' }} scale={scale as any}>
      <sphereGeometry args={[1, 25, 25]} />
      <meshPhongMaterial color={color} opacity={opacity} transparent />
    </a.mesh>
  );
};
```

### Accessing Graph State
```typescript
const MyComponent = () => {
  const nodes = useStore(state => state.nodes);
  const selections = useStore(state => state.selections);
  const setSelections = useStore(state => state.setSelections);
  // ...
};
```

### Using the GraphCanvas Ref
```typescript
const graphRef = useRef<GraphCanvasRef>(null);

// Available methods:
graphRef.current?.centerGraph(nodeIds, opts);
graphRef.current?.fitNodesInView(nodeIds, opts);
graphRef.current?.zoomIn();
graphRef.current?.zoomOut();
graphRef.current?.getGraph();
graphRef.current?.getControls();
graphRef.current?.exportCanvas();
```

## Engine Requirements
- Node.js: `^20.19.0 || >=22.12.0`
- React: `>=16` (peer dependency)
