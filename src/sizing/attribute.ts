import { SizingStrategy, SizingStrategyInputs } from './types';

export function attributeSizing({
  graph,
  attribute,
  defaultSize
}: SizingStrategyInputs): SizingStrategy {
  if (!attribute) {
    console.warn('Attribute sizing configured but no attribute provided');
  }

  const map = new Map();
  graph.forEachNode(node => {
    const size = node.data.data[attribute];
    if (isNaN(size)) {
      console.warn(`Attribute ${size} is not a number for node ${node.id}`);
    }

    map.set(node.id, size || 0);
  });

  return {
    getSizeForNode: (nodeId: string) => {
      if (!attribute || !map) {
        return defaultSize;
      }

      return map.get(nodeId);
    }
  };
}
