import { pageRankSizing } from './pageRank';
import { centralitySizing } from './centrality';
import { attributeSizing } from './attribute';
import { SizingStrategy } from './types';
import { Graph } from 'ngraph.graph';

export type SizingType = 'none' | 'pagerank' | 'centrality' | 'attribute';

export function nodeSizeProvider(
  graph: Graph,
  type: SizingType,
  sizingAttribute?: string
): SizingStrategy {
  if (type === 'pagerank') {
    return pageRankSizing(graph);
  } else if (type === 'centrality') {
    return centralitySizing(graph);
  } else if (type === 'attribute') {
    return attributeSizing(graph, sizingAttribute);
  } else if (type === 'none') {
    return {
      getSizeForNode: (id: string, size = 7) => size
    };
  }

  throw new Error(`Graph does not support ${type} sizing`);
}
