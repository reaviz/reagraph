import centrality from 'ngraph.centrality';
import { Graph } from 'ngraph.graph';
import { SizingStrategy } from './types';

export function centralitySizing(graph: Graph): SizingStrategy {
  const ranks = centrality.closeness(graph);
  return {
    ranks,
    getSizeForNode: (nodeID: string, size?: number) =>
      Math.max(ranks[nodeID] * 20, 5)
  };
}
