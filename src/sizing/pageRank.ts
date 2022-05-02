import pagerank from 'ngraph.pagerank';
import { SizingStrategy } from './types';

export function pageRankSizing(graph: any): SizingStrategy {
  const ranks = pagerank(graph);
  return {
    ranks,
    getSizeForNode: (nodeID: string, size?: number) =>
      Math.max(ranks[nodeID] * 80, 5)
  };
}
