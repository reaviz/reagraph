import { InternalGraphEdge, InternalGraphNode } from 'types';
import { DepthNode, getNodeDepth } from './depthUtils';
import { LayoutStrategy } from './types';
import { hierarchy, stratify, tree } from 'd3-hierarchy';
import { Graph } from 'ngraph.graph';

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
  const nodes: InternalGraphNode[] = [];
  const links: InternalGraphEdge[] = [];

  // Map the graph nodes / edges to D3 object
  graph.forEachNode(n => {
    nodes.push({ ...n } as any);
  });

  graph.forEachLink(l => {
    links.push({
      ...l,
      id: l.data.id,
      source: l.fromId,
      target: l.toId
    } as any);
  });

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
