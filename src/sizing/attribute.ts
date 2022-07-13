import { scaleLinear } from 'd3-scale';
import { extent } from 'd3-array';
import { SizingStrategy } from './types';
import { Graph } from 'ngraph.graph';

const SIZE_RANGE = [3, 15];
const DEFAULT_SIZE = 7;

export function attributeSizing(
  graph: Graph,
  attribute?: string
): SizingStrategy {
  const nodes = [];

  // Map the nodes from ngraph
  graph.forEachNode(node => {
    nodes.push(node);
  });

  let map;
  if (attribute) {
    const domain = extent(nodes, n => n.data.data[attribute]);
    const scale = scaleLinear().domain(domain).rangeRound(SIZE_RANGE);

    map = new Map();
    for (const node of nodes) {
      map.set(node.id, scale(node.data.data[attribute]));
    }
  }

  return {
    getSizeForNode: (nodeId: string, size = DEFAULT_SIZE) => {
      if (!attribute || !map) {
        return size;
      }

      return map.get(nodeId);
    }
  };
}
