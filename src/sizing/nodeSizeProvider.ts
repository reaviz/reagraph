import { pageRankSizing } from './pageRank';
import { centralitySizing } from './centrality';
import { attributeSizing } from './attribute';
import { SizingStrategy, SizingStrategyInputs } from './types';

export type SizingType = 'none' | 'pagerank' | 'centrality' | 'attribute';

export interface NodeSizeProviderInputs extends SizingStrategyInputs {
  type: SizingType;
}

export function nodeSizeProvider({
  type,
  ...rest
}: NodeSizeProviderInputs): SizingStrategy {
  if (type === 'pagerank') {
    return pageRankSizing(rest);
  } else if (type === 'centrality') {
    return centralitySizing(rest);
  } else if (type === 'attribute') {
    return attributeSizing(rest);
  } else if (type === 'none') {
    return {
      getSizeForNode: () => rest.defaultSize
    };
  }

  throw new Error(`Graph does not support ${type} sizing`);
}
