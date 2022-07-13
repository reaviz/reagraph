import { Graph } from 'ngraph.graph';
import pagerank from 'ngraph.pagerank';
import { SizingStrategy, SizingStrategyInputs } from './types';

export function pageRankSizing({
  graph,
  minSize,
  maxSize
}: SizingStrategyInputs): SizingStrategy {
  const ranks = pagerank(graph);
  return {
    ranks,
    getSizeForNode: (nodeID: string) =>
      Math.min(Math.max(ranks[nodeID] * 80, minSize), maxSize)
  };
}
