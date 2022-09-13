import { Graph } from 'ngraph.graph';
import { nodeSizeProvider, SizingType } from '../sizing';
import {
  GraphEdge,
  GraphNode,
  InternalGraphEdge,
  InternalGraphNode
} from '../types';
import { calcLabelVisibility, LabelVisibilityType } from './visibility';

export function buildGraph(
  graph: Graph,
  nodes: GraphNode[],
  edges: GraphEdge[]
) {
  graph.clear();
  graph.beginUpdate();

  for (const node of nodes) {
    graph.addNode(node.id, node);
  }

  for (const edge of edges) {
    graph.addLink(edge.source, edge.target, edge);
  }

  graph.endUpdate();
}

interface TransformGraphInput {
  graph: Graph;
  layout: any;
  sizingType?: SizingType;
  labelType?: LabelVisibilityType;
  sizingAttribute?: string;
  minNodeSize?: number;
  maxNodeSize?: number;
  defaultNodeSize?: number;
}

export function transformGraph({
  graph,
  layout,
  sizingType,
  labelType,
  sizingAttribute,
  defaultNodeSize,
  minNodeSize,
  maxNodeSize
}: TransformGraphInput) {
  const nodes: InternalGraphNode[] = [];
  const edges: InternalGraphEdge[] = [];
  const map = new Map<string, InternalGraphNode>();

  const sizes = nodeSizeProvider({
    graph,
    type: sizingType,
    attribute: sizingAttribute,
    minSize: minNodeSize,
    maxSize: maxNodeSize,
    defaultSize: defaultNodeSize
  });
  const nodeCount = graph.getNodesCount();
  const checkVisibility = calcLabelVisibility(nodeCount, labelType);

  graph.forEachNode((node: any) => {
    if (node.data) {
      const position = layout.getNodePosition(node.id);
      const { data, fill, icon, label, size, ...rest } = node.data;
      const nodeSize = sizes.get(node.id);
      const labelVisible = checkVisibility('node', nodeSize);
      const nodeLinks = graph.getLinks(node.id);
      const parents = nodeLinks
        ? [...nodeLinks].filter(l => l.toId === node.id).map(l => l.fromId)
        : null;
      const n: InternalGraphNode = {
        ...(node as any),
        size: nodeSize,
        labelVisible,
        label,
        icon,
        fill,
        parents,
        data: {
          ...rest,
          ...(data || {})
        },
        position: {
          ...position,
          z: position.z || 1
        }
      };

      map.set(node.id, n);
      nodes.push(n);
    }
  });

  graph.forEachLink((link: any) => {
    const from = map.get(link.fromId);
    const to = map.get(link.toId);

    if (from && to) {
      const { data, id, label, size, ...rest } = link.data;
      const labelVisible = checkVisibility('edge', link.size);

      edges.push({
        ...link,
        id,
        label,
        labelVisible,
        size,
        data: {
          ...rest,
          id,
          ...(data || {})
        }
      });
    }
  });

  return {
    nodes,
    edges
  };
}
