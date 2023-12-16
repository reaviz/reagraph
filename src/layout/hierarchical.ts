import { InternalGraphEdge, InternalGraphNode } from 'types';
import { DepthNode, getNodeDepth } from './depthUtils';
import { LayoutFactoryProps, LayoutStrategy } from './types';
import { hierarchy, stratify, tree } from 'd3-hierarchy';
import { buildNodeEdges } from './layoutUtils';

export interface HierarchicalLayoutInputs extends LayoutFactoryProps {
  /**
   * Direction of the layout. Default 'td'.
   */
  mode?: 'td' | 'lr';
  /**
   * Factor of distance between nodes. Default 1.
   */
  nodeSeparation?: number;
  /**
   * Size of each node. Default [50,50]
   */
  nodeSize?: [number, number];
}

const DIRECTION_MAP = {
  td: {
    x: 'x',
    y: 'y',
    factor: -1
  },
  lr: {
    x: 'y',
    y: 'x',
    factor: 1
  }
};

export function hierarchical({
  graph,
  drags,
  mode = 'td',
  nodeSeparation = 1,
  nodeSize = [50, 50],
  getNodePosition
}: HierarchicalLayoutInputs): LayoutStrategy {
  const { nodes, edges } = buildNodeEdges(graph);

  const { depths } = getNodeDepth(nodes, edges);
  const rootNodes = Object.keys(depths).map(d => depths[d]);

  const root = stratify<DepthNode>()
    .id(d => d.data.id)
    .parentId(d => d.ins?.[0]?.data?.id)(rootNodes);

  const treeRoot = tree()
    .separation(() => nodeSeparation)
    .nodeSize(nodeSize)(hierarchy(root));

  const treeNodes = treeRoot.descendants();
  const path = DIRECTION_MAP[mode];

  const mappedNodes = new Map<string, InternalGraphNode>(
    nodes.map(n => {
      const { x, y } = treeNodes.find((t: any) => t.data.id === n.id);
      return [
        n.id,
        {
          ...n,
          [path.x]: x * path.factor,
          [path.y]: y * path.factor,
          z: 0
        }
      ];
    })
  );

  return {
    step() {
      return true;
    },
    getNodePosition(id: string) {
      if (getNodePosition) {
        const pos = getNodePosition(id, { graph, drags, nodes, edges });
        if (pos) {
          return pos;
        }
      }

      if (drags?.[id]?.position) {
        // If we dragged, we need to use that position
        return drags?.[id]?.position as any;
      }

      return mappedNodes.get(id);
    }
  };
}
