import { Theme } from '../themes';
import Graph from 'graphology';

export type PathSelectionTypes = 'direct' | 'out' | 'in' | 'all';

/**
 * Given a graph and a list of node ids, return the adjacent nodes and edges.
 *
 * TODO: This method could be improved with the introduction of graphology
 */
export function getAdjacents(
  graph: Graph,
  nodeIds: string | string[],
  type: PathSelectionTypes
) {
  nodeIds = Array.isArray(nodeIds) ? nodeIds : [nodeIds];

  const nodes: string[] = [];
  const edges: string[] = [];

  for (const nodeId of nodeIds) {
    const graphLinks = [
      ...(graph.inEdgeEntries(nodeId) ?? []),
      ...(graph.outEdgeEntries(nodeId) ?? [])
    ];

    if (!graphLinks) {
      continue;
    }

    for (const link of graphLinks) {
      const linkId = link.attributes.id;

      if (type === 'in') {
        if (link.target === nodeId && !edges.includes(linkId)) {
          edges.push(linkId);
        }
      } else if (type === 'out') {
        if (link.source === nodeId && !edges.includes(linkId)) {
          edges.push(linkId);
        }
      } else {
        if (!edges.includes(linkId)) {
          edges.push(linkId);
        }
      }

      if (type === 'out' || type === 'all') {
        const toId = link.target;
        if (!nodes.includes(toId as string)) {
          nodes.push(toId as string);
        }
      }

      if (type === 'in' || type === 'all') {
        if (!nodes.includes(link.source)) {
          nodes.push(link.source as string);
        }
      }
    }
  }

  return {
    nodes,
    edges
  };
}

/**
 * Set the vectors.
 */
export function prepareRay(event, vec, size) {
  const { offsetX, offsetY } = event;
  const { width, height } = size;
  vec.set((offsetX / width) * 2 - 1, -(offsetY / height) * 2 + 1);
}

/**
 * Create a lasso element.
 */
export function createElement(theme: Theme) {
  const element = document.createElement('div');
  element.style.pointerEvents = 'none';
  element.style.border = theme.lasso.border;
  element.style.backgroundColor = theme.lasso.background;
  element.style.position = 'fixed';
  return element;
}
