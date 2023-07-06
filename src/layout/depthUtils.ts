import { InternalGraphEdge, InternalGraphNode } from '../types';

export interface DepthNode {
  data: InternalGraphNode;
  ins: DepthNode[];
  out: DepthNode[];
  depth: number;
}

/**
 * Traverse the graph and get the depth of each node.
 */
function traverseGraph(nodes: DepthNode[], nodeStack: DepthNode[] = []) {
  const currentDepth = nodeStack.length;

  for (const node of nodes) {
    const idx = nodeStack.indexOf(node);
    if (idx > -1) {
      const loop = [...nodeStack.slice(idx), node].map(d => d.data.id);
      throw new Error(
        `Invalid Graph: Circular node path detected: ${loop.join(' -> ')}.`
      );
    }

    if (currentDepth > node.depth) {
      node.depth = currentDepth;
      traverseGraph(node.out, [...nodeStack, node]);
    }
  }
}

/**
 * Gets the depth of the graph's nodes. Used in the radial layout.
 */
export function getNodeDepth(
  nodes: InternalGraphNode[],
  links: InternalGraphEdge[]
) {
  let invalid = false;

  const graph: { [key: string]: DepthNode } = nodes.reduce(
    (acc, cur) => ({
      ...acc,
      [cur.id]: {
        data: cur,
        out: [],
        depth: -1,
        ins: []
      }
    }),
    {}
  );

  try {
    for (const link of links) {
      const from = link.source;
      const to = link.target;

      if (!graph.hasOwnProperty(from)) {
        throw new Error(`Missing source Node ${from}`);
      }

      if (!graph.hasOwnProperty(to)) {
        throw new Error(`Missing target Node ${to}`);
      }

      const sourceNode = graph[from];
      const targetNode = graph[to];
      targetNode.ins.push(sourceNode);
      sourceNode.out.push(targetNode);
    }

    traverseGraph(Object.values(graph));
  } catch (e) {
    invalid = true;
  }

  const allDepths = Object.keys(graph).map(id => graph[id].depth);
  const maxDepth = Math.max(...allDepths);

  return {
    invalid,
    depths: graph,
    maxDepth: maxDepth || 1
  };
}
