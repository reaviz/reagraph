import pagerank from 'ngraph.pagerank';
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
