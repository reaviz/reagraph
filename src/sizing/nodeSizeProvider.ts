import { pageRankSizing } from './pageRank';
import { centralitySizing } from './centrality';
import { attributeSizing } from './attribute';
import { SizingStrategyInputs } from './types';
import { scaleLinear } from 'd3-scale';

export type SizingType = 'none' | 'pagerank' | 'centrality' | 'attribute';

export interface NodeSizeProviderInputs extends SizingStrategyInputs {
  type: SizingType;
}

const providers = {
  pagerank: pageRankSizing,
  centrality: centralitySizing,
  attribute: attributeSizing,
  none: ({ defaultSize }: SizingStrategyInputs) => ({
    getSizeForNode: (_id: string) => defaultSize
  })
};

export function nodeSizeProvider({ type, ...rest }: NodeSizeProviderInputs) {
  const provider = providers[type]?.(rest);
  if (!provider) {
    throw new Error(`Unknown sizing strategy: ${type}`);
  }

  const { graph, minSize, maxSize } = rest;
  const sizes = new Map();
  let min;
  let max;

  graph.forEachNode(node => {
    const size = node.data?.size || provider.getSizeForNode(node.id as string);

    if (min === undefined || size < min) {
      min = size;
    }

    if (max === undefined || size > max) {
      max = size;
    }

    sizes.set(node.id, size);
  });

  if (type !== 'none') {
    const scale = scaleLinear()
      .domain([min, max])
      .rangeRound([minSize, maxSize]);

    for (const [nodeId, size] of sizes) {
      sizes.set(nodeId, scale(size));
    }
  }

  return sizes;
}
