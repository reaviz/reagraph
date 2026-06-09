/* eslint-disable no-console */
/**
 * Large-scale graph performance harness.
 *
 * This is NOT a unit test — it's a deterministic CPU benchmark that
 * reproduces the per-interaction-frame work the React components perform
 * against the Zustand store. It lets us measure the algorithmic cost of a
 * drag/hover frame (which scales with graph size) before and after
 * optimizations, without needing a GPU/WebGL context.
 *
 * Run with: npx vitest run perf/largeGraph.bench.test.ts
 */
import Graph from 'graphology';
import { test } from 'vitest';

import { createStore } from '../src/store';
import type { GraphEdge, GraphNode } from '../src/types';
import { buildGraph, transformGraph } from '../src/utils/graph';

// ---------------------------------------------------------------------------
// Fixture generation
// ---------------------------------------------------------------------------

function makeGraphData(nodeCount: number, edgesPerNode: number) {
  const nodes: GraphNode[] = [];
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({ id: `n-${i}`, label: `Node ${i}`, data: {} });
  }

  const edges: GraphEdge[] = [];
  for (let i = 0; i < nodeCount; i++) {
    for (let j = 1; j <= edgesPerNode; j++) {
      const target = (i + j * 7) % nodeCount;
      if (target === i) {
        continue;
      }
      edges.push({
        id: `e-${i}-${j}`,
        source: `n-${i}`,
        target: `n-${target}`
      });
    }
  }

  return { nodes, edges };
}

// A lightweight layout stub: transformGraph only needs getNodePosition.
// We are measuring transform/store/render-frame cost, not the d3 simulation.
function makeLayout(nodeCount: number) {
  const positions = new Map<string, { x: number; y: number; z: number }>();
  for (let i = 0; i < nodeCount; i++) {
    positions.set(`n-${i}`, {
      x: Math.cos(i) * 500,
      y: Math.sin(i) * 500,
      z: 0
    });
  }
  return {
    getNodePosition: (id: string) => positions.get(id) ?? { x: 0, y: 0, z: 0 }
  } as any;
}

function time(label: string, fn: () => void) {
  // Warm up
  fn();
  const runs = 5;
  const start = performance.now();
  for (let i = 0; i < runs; i++) {
    fn();
  }
  const ms = (performance.now() - start) / runs;
  console.log(`  ${label.padEnd(46)} ${ms.toFixed(3)} ms`);
  return ms;
}

function runScenario(nodeCount: number, edgesPerNode: number) {
  const { nodes, edges } = makeGraphData(nodeCount, edgesPerNode);
  const graph = new Graph({ multi: true });
  buildGraph(graph, nodes, edges);
  const layout = makeLayout(nodeCount);
  const { nodes: internalNodes, edges: internalEdges } = transformGraph({
    graph,
    layout,
    sizingType: 'default',
    defaultNodeSize: 7
  });

  const store = createStore({});
  const api = store.getState();
  api.setNodes(internalNodes);
  api.setEdges(internalEdges);

  console.log(
    `\n=== ${nodeCount} nodes / ${internalEdges.length} edges ===`
  );

  // --- 1. Layout transform (rebuild) cost ---
  time('transformGraph (full rebuild)', () => {
    transformGraph({ graph, layout, sizingType: 'default', defaultNodeSize: 7 });
  });

  // --- 2. Per-node lookup the way <Node> resolves its own data ---
  // This selector runs once per node on EVERY store update.
  const ids = internalNodes.map(n => n.id);
  time('node self-lookup x N (per render frame)', () => {
    const state = store.getState() as any;
    for (const id of ids) {
      // Mirror src/symbols/Node.tsx: prefer O(1) map if present.
      const node = state.nodeMap
        ? state.nodeMap.get(id)
        : state.nodes.find((n: any) => n.id === id);
      if (!node) {
        throw new Error('missing node');
      }
    }
  });

  // --- 3. canCollapse computation the way <Node> derives it ---
  // Mirror src/symbols/Node.tsx canCollapse.
  time('canCollapse derivation x N', () => {
    const state = store.getState() as any;
    for (const id of ids) {
      if (state.nodesWithOutboundEdges) {
        // O(1) per node
        const _ = state.nodesWithOutboundEdges.has(id);
      } else {
        // Legacy: O(E) filter per node
        const _ = state.edges.filter((l: any) => l.source === id).length > 0;
      }
    }
  });

  // --- 4. A drag frame: setNodePosition + all node self-lookups ---
  let toggle = 0;
  time('drag frame (setNodePosition + N lookups)', () => {
    const draggedId = ids[toggle++ % ids.length];
    store.getState().setNodePosition(draggedId, {
      x: Math.random() * 500,
      y: Math.random() * 500,
      z: 0
    } as any);
    const state = store.getState() as any;
    for (const id of ids) {
      const node = state.nodeMap
        ? state.nodeMap.get(id)
        : state.nodes.find((n: any) => n.id === id);
      if (!node) {
        throw new Error('missing node');
      }
    }
  });
}

test('large graph performance baseline', () => {
  console.log('\n========== REAGRAPH PERF HARNESS ==========');
  runScenario(1000, 4);
  runScenario(2500, 4);
  runScenario(5000, 4);
}, 120000);
