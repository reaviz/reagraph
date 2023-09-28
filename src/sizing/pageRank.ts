import pagerank from 'graphology-metrics/centrality/pagerank.js';
import { SizingStrategy, SizingStrategyInputs } from './types';

export function pageRankSizing({
  graph
}: SizingStrategyInputs): SizingStrategy {
  const ranks = pagerank(graph);

  return {
    ranks,
    getSizeForNode: (nodeID: string) => ranks[nodeID] * 80
  };
}
