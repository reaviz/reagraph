import { degreeCentrality } from 'graphology-metrics/centrality/degree.js';

import type { SizingStrategy, SizingStrategyInputs } from './types';

export function centralitySizing({
  graph
}: SizingStrategyInputs): SizingStrategy {
  const ranks = degreeCentrality(graph);

  return {
    ranks,
    getSizeForNode: (nodeID: string) => ranks[nodeID] * 20
  };
}
