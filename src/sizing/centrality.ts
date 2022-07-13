import centrality from 'ngraph.centrality';
import { SizingStrategy, SizingStrategyInputs } from './types';

export function centralitySizing({
  graph,
  minSize,
  maxSize
}: SizingStrategyInputs): SizingStrategy {
  const ranks = centrality.closeness(graph);
  return {
    ranks,
    getSizeForNode: (nodeID: string) =>
      Math.min(Math.max(ranks[nodeID] * 20, minSize), maxSize)
  };
}
