import { Graph } from 'ngraph.graph';
import { Theme } from '../themes';

export type PathSelectionTypes = 'direct' | 'out' | 'in' | 'all';

export function getAdjacents(
  graph: Graph,
  nodeIds: string | string[],
  type: PathSelectionTypes
) {
  nodeIds = Array.isArray(nodeIds) ? nodeIds : [nodeIds];

  const nodes: string[] = [];
  const edges: string[] = [];

  for (const nodeId of nodeIds) {
    const graphLinks = graph.getLinks(nodeId);

    if (!graphLinks) {
      continue;
    }

    graphLinks.forEach(link => {
      const linkId = link.data.id;

      if (type === 'in') {
        if (link.toId === nodeId && !edges.includes(linkId)) {
          edges.push(linkId);
        }
      } else if (type === 'out') {
        if (link.fromId === nodeId && !edges.includes(linkId)) {
          edges.push(linkId);
        }
      } else {
        if (!edges.includes(linkId)) {
          edges.push(linkId);
        }
      }

      if (type === 'out' || type === 'all') {
        const toId = link.toId;
        if (!nodes.includes(toId as string)) {
          nodes.push(toId as string);
        }
      }

      if (type === 'in' || type === 'all') {
        const fromId = link.fromId;
        if (!nodes.includes(fromId as string)) {
          nodes.push(fromId as string);
        }
      }
    });
  }

  return {
    nodes,
    edges
  };
}

export function prepareRay(event, vec, size) {
  const { offsetX, offsetY } = event;
  const { width, height } = size;
  vec.set((offsetX / width) * 2 - 1, -(offsetY / height) * 2 + 1);
}

export function createElement(theme: Theme) {
  const element = document.createElement('div');
  element.style.pointerEvents = 'none';
  element.style.border = theme.lasso.border;
  element.style.backgroundColor = theme.lasso.background;
  element.style.position = 'fixed';
  return element;
}
