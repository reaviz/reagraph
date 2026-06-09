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

  console.log(`\n=== ${nodeCount} nodes / ${internalEdges.length} edges ===`);

  // --- 1. Layout transform (rebuild) cost ---
  time('transformGraph (full rebuild)', () => {
    transformGraph({
      graph,
      layout,
      sizingType: 'default',
      defaultNodeSize: 7
    });
  });

  // --- 2. Per-node lookup the way <Node> resolves its own data ---
  // This selector runs once per node on EVERY store update.
  const ids = internalNodes.map(n => n.id);
  // Mirror src/symbols/Node.tsx: each node resolves its own data on every
  // store update. Compare the old O(n) scan against the current O(1) map.
  time('node self-lookup x N — Array.find [old]', () => {
    const state = store.getState() as any;
    for (const id of ids) {
      if (!state.nodes.find((n: any) => n.id === id)) {
        throw new Error('missing node');
      }
    }
  });
  time('node self-lookup x N — nodeMap.get [new]', () => {
    const state = store.getState() as any;
    for (const id of ids) {
      if (!state.nodeMap.get(id)) {
        throw new Error('missing node');
      }
    }
  });

  // --- 3. canCollapse the way <Node> derives it ---
  // Old: O(e) edge filter per node. New: O(1) set membership.
  time('canCollapse x N — edges.filter [old]', () => {
    const state = store.getState() as any;
    for (const id of ids) {
      void (state.edges.filter((l: any) => l.source === id).length > 0);
    }
  });
  time('canCollapse x N — outboundSet.has [new]', () => {
    const state = store.getState() as any;
    for (const id of ids) {
      void state.nodesWithOutboundEdges.has(id);
    }
  });

  // --- 3b. Edge grouping (Edges.tsx) with a large selection ---
  // Mirrors the active/inactive split. Old code did Array.includes per edge
  // against selections/actives/hovered (O(e * s)); new code uses a Set.
  const selection = ids
    .slice(0, Math.floor(internalEdges.length / 5))
    .map((_, i) => internalEdges[i].id);
  time('edge grouping (Array.includes per edge) [old]', () => {
    const active: any[] = [];
    const inactive: any[] = [];
    internalEdges.forEach(edge => {
      if (selection.includes(edge.id)) {
        active.push(edge);
      } else {
        inactive.push(edge);
      }
    });
  });
  time('edge grouping (Set.has per edge) [new]', () => {
    const set = new Set(selection);
    const active: any[] = [];
    const inactive: any[] = [];
    internalEdges.forEach(edge => {
      if (set.has(edge.id)) {
        active.push(edge);
      } else {
        inactive.push(edge);
      }
    });
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
      if (!state.nodeMap.get(id)) {
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
