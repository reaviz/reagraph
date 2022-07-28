import { RefObject } from 'react';
import { GraphCanvasRef } from '../GraphCanvas';

export type PathSelectionTypes = 'direct' | 'out' | 'in' | 'all';

export const getAdjacents = (
  ref: RefObject<GraphCanvasRef | null>,
  nodeIds: string | string[],
  type: PathSelectionTypes
) => {
  const results = [];

  const graph = ref.current.getGraph();
  if (graph) {
    nodeIds = Array.isArray(nodeIds) ? nodeIds : [nodeIds];

    for (const nodeId of nodeIds) {
      graph.getLinks(nodeId).forEach(link => {
        const linkId = link.data.id;

        if (type === 'in') {
          if (link.toId === nodeId && !results.includes(linkId)) {
            results.push(linkId);
          }
        } else if (type === 'out') {
          if (link.fromId === nodeId && !results.includes(linkId)) {
            results.push(linkId);
          }
        } else {
          if (!results.includes(linkId)) {
            results.push(linkId);
          }
        }

        if (type === 'out' || type === 'all') {
          const toId = link.toId;
          if (!results.includes(toId)) {
            results.push(toId);
          }
        }

        if (type === 'in' || type === 'all') {
          const fromId = link.fromId;
          if (!results.includes(fromId)) {
            results.push(fromId);
          }
        }
      });
    }
  }

  return results;
};
