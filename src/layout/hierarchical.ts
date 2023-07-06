import { InternalGraphEdge, InternalGraphNode } from 'types';
import { DepthNode, getNodeDepth } from './depthUtils';
import { LayoutFactoryProps, LayoutStrategy } from './types';
import { hierarchy, stratify, tree } from 'd3-hierarchy';

export interface HierarchicalLayoutInputs extends LayoutFactoryProps {
  mode?: 'td' | 'lr';
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
  mode = 'td'
}: HierarchicalLayoutInputs): LayoutStrategy {
  const nodes: InternalGraphNode[] = [];
  const edges: InternalGraphEdge[] = [];

  graph.forEachNode((id, n: any) => {
    nodes.push({ ...n, id });
  });

  graph.forEachEdge((id, l: any) => {
    edges.push({ ...l, id });
  });

  const { depths } = getNodeDepth(nodes, edges);
  const rootNodes = Object.keys(depths).map(d => depths[d]);

  const root = stratify<DepthNode>()
    .id(d => d.data.id)
    .parentId(d => d.ins?.[0]?.data?.id)(rootNodes);

  const treeRoot = tree()
    .separation(() => 1)
    .nodeSize([50, 50])(hierarchy(root));

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
      // If we dragged, we need to use that position
      return (drags?.[id]?.position as any) || mappedNodes.get(id);
    }
  };
}
