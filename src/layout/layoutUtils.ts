import type Graph from 'graphology';

import type { InternalGraphEdge, InternalGraphNode } from '../types';
import type { LayoutStrategy } from './types';

/**
 * Promise based tick helper.
 */
export function tick(layout: LayoutStrategy) {
  return new Promise(async (resolve, _reject) => {
    let stable: boolean | undefined;

    async function run() {
      if (!stable) {
        stable = await layout.step();
        if (!stable) {
          // Use requestAnimationFrame for better performance in async scenarios
          requestAnimationFrame(run);
        } else {
          resolve(stable);
        }
      } else {
        resolve(stable);
      }
    }

    run();
  });
}

/**
 * Helper function to turn the graph nodes/edges into an array for
 * easier manipulation.
 */
export function buildNodeEdges(graph: Graph) {
  const nodes: InternalGraphNode[] = [];
  const edges: InternalGraphEdge[] = [];

  graph.forEachNode((id, n: any) => {
    nodes.push({
      ...n,
      id,
      // This is for the clustering
      radius: n.size || 1
    });
  });

  graph.forEachEdge((id, l: any) => {
    edges.push({ ...l, id });
  });

  return { nodes, edges };
}
