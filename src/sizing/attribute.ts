import { scaleLinear } from 'd3-scale';
import { extent } from 'd3-array';
import { SizingStrategy, SizingStrategyInputs } from './types';

export function attributeSizing({
  graph,
  attribute,
  defaultSize,
  minSize,
  maxSize
}: SizingStrategyInputs): SizingStrategy {
  const nodes = [];

  // Map the nodes from ngraph
  graph.forEachNode(node => {
    nodes.push(node);
  });

  let map;
  if (attribute) {
    const domain = extent(nodes, n => n.data.data[attribute]);
    const scale = scaleLinear().domain(domain).rangeRound([minSize, maxSize]);

    map = new Map();
    for (const node of nodes) {
      map.set(node.id, scale(node.data.data[attribute]));
    }
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
