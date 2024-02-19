import Graph from 'graphology';
import { LayoutStrategy } from './types';
import { InternalGraphEdge, InternalGraphNode } from '../types';

/**
 * Promise based tick helper.
 */
export function tick(layout: LayoutStrategy) {
  return new Promise((resolve, _reject) => {
    let stable: boolean | undefined;

    function run() {
      if (!stable) {
        stable = layout.step();
        run();
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
