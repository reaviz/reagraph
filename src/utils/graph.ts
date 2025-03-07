import Graph from 'graphology';
import { nodeSizeProvider, SizingType } from '../sizing';
import {
  GraphEdge,
  GraphNode,
  InternalGraphEdge,
  InternalGraphNode
} from '../types';
import { calcLabelVisibility, LabelVisibilityType } from './visibility';
import { LayoutStrategy } from '../layout';

/**
 * Initialize the graph with the nodes/edges.
 */
export function buildGraph(
  graph: Graph,
  nodes: GraphNode[],
  edges: GraphEdge[]
) {
  // TODO: We probably want to make this
  // smarter and only add/remove nodes
  graph.clear();

  const addedNodes = new Set<string>();

  for (const node of nodes) {
    try {
      if (!addedNodes.has(node.id)) {
        graph.addNode(node.id, node);
        addedNodes.add(node.id);
      }
    } catch (e) {
      console.error(`[Graph] Error adding node '${node.id}`, e);
    }
  }

  for (const edge of edges) {
    if (!addedNodes.has(edge.source) || !addedNodes.has(edge.target)) {
      continue;
    }

    try {
      graph.addEdge(edge.source, edge.target, edge);
    } catch (e) {
      console.error(`[Graph] Error adding edge '${edge.source} -> ${edge.target}`, e);
    }
  }

  return graph;
}

interface TransformGraphInput {
  graph: Graph;
  layout: LayoutStrategy;
  sizingType?: SizingType;
  labelType?: LabelVisibilityType;
  sizingAttribute?: string;
  minNodeSize?: number;
  maxNodeSize?: number;
  defaultNodeSize?: number;
  clusterAttribute?: string;
}

/**
 * Transform the graph into a format that is easier to work with.
 */
export function transformGraph({
  graph,
  layout,
  sizingType,
  labelType,
  sizingAttribute,
  defaultNodeSize,
  minNodeSize,
  maxNodeSize,
  clusterAttribute
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

  const nodeCount = graph.nodes().length;
  const checkVisibility = calcLabelVisibility({ nodeCount, labelType });

  graph.forEachNode((id, node) => {
    const position = layout.getNodePosition(id);
    const { data, fill, icon, label, size, ...rest } = node;
    const nodeSize = sizes.get(node.id);
    const labelVisible = checkVisibility('node', nodeSize);

    const nodeLinks = graph.inboundNeighbors(node.id) || [];
    const parents = nodeLinks.map(n => graph.getNodeAttributes(n));

    const n: InternalGraphNode = {
      ...(node as any),
      size: nodeSize,
      labelVisible,
      label,
      icon,
      fill,
      cluster: clusterAttribute ? data[clusterAttribute] : undefined,
      parents,
      data: {
        ...rest,
        ...(data ?? {})
      },
      position: {
        ...position,
        x: position.x || 0,
        y: position.y || 0,
        z: position.z || 1
      }
    };

    map.set(node.id, n);
    nodes.push(n);
  });

  graph.forEachEdge((_id, link) => {
    const from = map.get(link.source);
    const to = map.get(link.target);

    if (from && to) {
      const { data, id, label, size, ...rest } = link;
      const labelVisible = checkVisibility('edge', size);

      // TODO: Fix type
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
      } as any);
    }
  });

  return {
    nodes,
    edges
  };
}
