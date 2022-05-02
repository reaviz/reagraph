import centrality from 'ngraph.centrality';
import { SizingStrategy } from './types';

export function centralitySizing(graph: any): SizingStrategy {
  const ranks = centrality.closeness(graph);
  return {
    ranks,
    getSizeForNode: (nodeID: string, size?: number) =>
      Math.max(ranks[nodeID] * 20, 5)
  };
}
