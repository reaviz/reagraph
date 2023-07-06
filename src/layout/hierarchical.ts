import { InternalGraphEdge, InternalGraphNode } from 'types';
import { DepthNode, getNodeDepth } from './depthUtils';
import { LayoutStrategy } from './types';
import { hierarchy, stratify, tree } from 'd3-hierarchy';
import Graph from 'graphology';

export interface HierarchicalLayoutInputs {
  graph: Graph;
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
  mode = 'td'
}: HierarchicalLayoutInputs): LayoutStrategy {
  // TODO: Fix types
  const nodes: InternalGraphNode[] = graph.nodeEntries() as any;
  const links: InternalGraphEdge[] = graph.edgeEntries() as any;

  const { depths } = getNodeDepth(nodes, links);
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
      let { x, y } = treeNodes.find((t: any) => t.data.id === n.id);
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
      return mappedNodes.get(id);
    }
  };
}
