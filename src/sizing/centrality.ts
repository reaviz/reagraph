import { SizingStrategy, SizingStrategyInputs } from './types';
import { degreeCentrality } from 'graphology-metrics/centrality/degree';

export function centralitySizing({
  graph
}: SizingStrategyInputs): SizingStrategy {
  const ranks = degreeCentrality(graph);

  return {
    ranks,
    getSizeForNode: (nodeID: string) => ranks[nodeID] * 20
  };
}
