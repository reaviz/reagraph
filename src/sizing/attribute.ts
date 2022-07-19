import { SizingStrategy, SizingStrategyInputs } from './types';

export function attributeSizing({
  graph,
  attribute,
  defaultSize
}: SizingStrategyInputs): SizingStrategy {
  const map = new Map();

  if (attribute) {
    graph.forEachNode(node => {
      const size = node.data.data[attribute];
      if (isNaN(size)) {
        console.warn(`Attribute ${size} is not a number for node ${node.id}`);
      }

      map.set(node.id, size || 0);
    });
  } else {
    console.warn('Attribute sizing configured but no attribute provided');
  }

  return {
    getSizeForNode: (nodeId: string) => {
      if (!attribute || !map) {
        return defaultSize;
      }

      return map.get(nodeId);
    }
  };
}
