import type { Graph as CosmosGraph } from '@cosmos.gl/graph';
import type { GraphConfigInterface } from '@cosmos.gl/graph/dist/config';
import type Graph from 'graphology';
import { Color, type ColorRepresentation } from 'three';

import { getVisibleEntities } from '../collapse';
import type { LayoutOverrides, LayoutTypes } from '../layout';
import { layoutProvider } from '../layout';
import { tick } from '../layout/layoutUtils';
import type { SizingType } from '../sizing';
import type { Theme } from '../themes';
import type {
  GraphEdge,
  GraphNode,
  InternalGraphEdge,
  InternalGraphNode
} from '../types';
import { aggregateEdges as aggregateEdgesUtil } from '../utils/aggregateEdges';
import { buildGraph, transformGraph } from '../utils/graph';
import { getEdgeRenderStyle, getNodeRenderStyle } from '../utils/renderStyles';
import type { LabelVisibilityType } from '../utils/visibility';

export interface CosmosConfig extends Partial<GraphConfigInterface> {
  /**
   * Maximum number of DOM labels rendered by the cosmos renderer.
   */
  labelMaxCount?: number;

  /**
   * Minimum interval, in milliseconds, between cosmos label overlay updates.
   */
  labelUpdateInterval?: number;
}

export interface PreparedCosmosGraph {
  graph: Graph;
  nodes: InternalGraphNode[];
  edges: InternalGraphEdge[];
  nodeIndexById: Map<string, number>;
}

export interface PrepareCosmosGraphInput {
  graph: Graph;
  nodes: GraphNode[];
  edges: GraphEdge[];
  aggregateEdges?: boolean;
  collapsedNodeIds?: string[];
  clusterAttribute?: string;
  defaultNodeSize?: number;
  labelType?: LabelVisibilityType;
  layoutOverrides?: LayoutOverrides;
  layoutType?: LayoutTypes;
  maxNodeSize?: number;
  minNodeSize?: number;
  sizingAttribute?: string;
  sizingType?: SizingType;
}

export interface BuildCosmosConfigInput {
  config?: CosmosConfig;
  defaultNodeSize?: number;
  disabled?: boolean;
  draggable?: boolean;
  edgeArrowPosition?: 'none' | 'mid' | 'end';
  edgeInterpolation?: 'linear' | 'curved';
  onBackgroundClick?: (event: MouseEvent) => void;
  onLinkClick?: GraphConfigInterface['onLinkClick'];
  onLinkMouseOut?: GraphConfigInterface['onLinkMouseOut'];
  onLinkMouseOver?: GraphConfigInterface['onLinkMouseOver'];
  onPointDragEnd?: GraphConfigInterface['onDragEnd'];
  onPointClick?: GraphConfigInterface['onPointClick'];
  onPointMouseOut?: GraphConfigInterface['onPointMouseOut'];
  onPointMouseOver?: GraphConfigInterface['onPointMouseOver'];
  theme: Theme;
}

export interface BuildCosmosBuffersInput {
  activeEdgeIds?: Set<string>;
  activeNodeIds?: Set<string>;
  colorActiveEdgeIds?: Set<string>;
  defaultNodeSize?: number;
  edgeArrowPosition?: 'none' | 'mid' | 'end';
  hasSelections?: boolean;
  preparedGraph: PreparedCosmosGraph;
  selectedIds?: Set<string>;
  theme: Theme;
}

export interface CosmosBuffers {
  linkArrows: boolean[];
  linkColors: Float32Array;
  links: Float32Array;
  linkWidths: Float32Array;
  pointColors: Float32Array;
  pointPositions: Float32Array;
  pointSizes: Float32Array;
}

export const applyCosmosBuffers = (
  graph: CosmosGraph,
  buffers: CosmosBuffers,
  animated?: boolean
) => {
  graph.setPointPositions(buffers.pointPositions, true);
  graph.setPointColors(buffers.pointColors);
  graph.setPointSizes(buffers.pointSizes);
  graph.setLinks(buffers.links);
  graph.setLinkColors(buffers.linkColors);
  graph.setLinkWidths(buffers.linkWidths);
  graph.setLinkArrows(buffers.linkArrows);
  graph.render(animated ? undefined : 0);
};

export const toHexColor = (
  color: ColorRepresentation | undefined,
  fallback: string
): string => {
  if (!color) {
    return fallback;
  }

  return `#${new Color(color).getHexString()}`;
};

const setRgba = (
  target: Float32Array,
  offset: number,
  color: ColorRepresentation,
  opacity: number
) => {
  const parsed = new Color(color);
  target[offset] = parsed.r;
  target[offset + 1] = parsed.g;
  target[offset + 2] = parsed.b;
  target[offset + 3] = opacity;
};

const getCosmosGraphConfig = (
  config?: CosmosConfig
): Partial<GraphConfigInterface> => {
  if (!config) {
    return {};
  }

  const { labelMaxCount, labelUpdateInterval, ...graphConfig } = config;
  void labelMaxCount;
  void labelUpdateInterval;

  return graphConfig;
};

export const buildCosmosConfig = ({
  config,
  defaultNodeSize,
  disabled,
  draggable,
  edgeArrowPosition = 'end',
  edgeInterpolation = 'linear',
  onBackgroundClick,
  onLinkClick,
  onLinkMouseOut,
  onLinkMouseOver,
  onPointDragEnd,
  onPointClick,
  onPointMouseOut,
  onPointMouseOver,
  theme
}: BuildCosmosConfigInput): CosmosConfig => ({
  backgroundColor: toHexColor(theme.canvas?.background, '#fff'),
  pointDefaultColor: toHexColor(theme.node.fill, '#7CA0AB'),
  pointDefaultSize: defaultNodeSize,
  pointOpacity: 1,
  linkDefaultColor: toHexColor(theme.edge.fill, '#D8E6EA'),
  linkDefaultWidth: 1,
  linkOpacity: 1,
  linkDefaultArrows: edgeArrowPosition !== 'none',
  linkVisibilityMinTransparency: 1,
  curvedLinks: edgeInterpolation === 'curved',
  enableDrag: Boolean(draggable && !disabled),
  enableZoom: !disabled,
  fitViewOnInit: true,
  fitViewDelay: 250,
  fitViewPadding: 0.1,
  hoveredPointCursor: onPointClick && !disabled ? 'pointer' : 'auto',
  hoveredLinkCursor: onLinkClick && !disabled ? 'pointer' : 'auto',
  renderHoveredPointRing: true,
  hoveredPointRingColor: toHexColor(theme.node.activeFill, '#1DE9AC'),
  focusedPointRingColor: toHexColor(theme.node.activeFill, '#1DE9AC'),
  enableSimulation: false,
  rescalePositions: false,
  attribution: '',
  onBackgroundClick,
  onPointClick,
  onPointMouseOver,
  onPointMouseOut,
  onLinkClick,
  onLinkMouseOver,
  onLinkMouseOut,
  onDragEnd: onPointDragEnd,
  ...getCosmosGraphConfig(config)
});

export const prepareCosmosGraph = async ({
  graph,
  nodes,
  edges,
  aggregateEdges,
  collapsedNodeIds = [],
  clusterAttribute,
  defaultNodeSize,
  labelType,
  layoutOverrides,
  layoutType,
  maxNodeSize,
  minNodeSize,
  sizingAttribute,
  sizingType
}: PrepareCosmosGraphInput): Promise<PreparedCosmosGraph> => {
  const { visibleEdges, visibleNodes } = getVisibleEntities({
    collapsedIds: collapsedNodeIds,
    nodes,
    edges
  });

  if (
    clusterAttribute &&
    !(layoutType === 'forceDirected2d' || layoutType === 'forceDirected3d')
  ) {
    throw new Error(
      'Clustering is only supported for the force directed layouts.'
    );
  }

  buildGraph(graph, visibleNodes, visibleEdges);

  const layout = layoutProvider({
    ...layoutOverrides,
    type: layoutType,
    graph,
    drags: {},
    clusters: new Map(),
    clusterAttribute
  });

  await tick(layout);

  const result = transformGraph({
    graph,
    layout,
    sizingType,
    labelType,
    sizingAttribute,
    maxNodeSize,
    minNodeSize,
    defaultNodeSize,
    clusterAttribute
  });

  const renderedEdges = aggregateEdges
    ? aggregateEdgesUtil(graph, labelType)
    : result.edges;

  return {
    graph,
    nodes: result.nodes,
    edges: renderedEdges,
    nodeIndexById: new Map(result.nodes.map((node, index) => [node.id, index]))
  };
};

export const buildCosmosBuffers = ({
  activeEdgeIds = new Set(),
  activeNodeIds = new Set(),
  colorActiveEdgeIds = activeEdgeIds,
  defaultNodeSize,
  edgeArrowPosition = 'end',
  hasSelections,
  preparedGraph,
  selectedIds = new Set(),
  theme
}: BuildCosmosBuffersInput): CosmosBuffers => {
  const { nodes, edges, nodeIndexById } = preparedGraph;
  const pointPositions = new Float32Array(nodes.length * 2);
  const pointColors = new Float32Array(nodes.length * 4);
  const pointSizes = new Float32Array(nodes.length);

  nodes.forEach((node, index) => {
    const positionOffset = index * 2;
    pointPositions[positionOffset] = node.position.x;
    pointPositions[positionOffset + 1] = node.position.y;

    const active = activeNodeIds.has(node.id) || selectedIds.has(node.id);
    const style = getNodeRenderStyle({
      node,
      theme,
      active,
      hasSelections
    });

    setRgba(pointColors, index * 4, style.color, style.opacity);
    pointSizes[index] = node.size ?? defaultNodeSize;
  });

  const links: number[] = [];
  const renderedEdges: InternalGraphEdge[] = [];

  edges.forEach(edge => {
    const sourceIndex = nodeIndexById.get(edge.source);
    const targetIndex = nodeIndexById.get(edge.target);

    if (sourceIndex !== undefined && targetIndex !== undefined) {
      links.push(sourceIndex, targetIndex);
      renderedEdges.push(edge);
    }
  });

  const linkColors = new Float32Array(renderedEdges.length * 4);
  const linkWidths = new Float32Array(renderedEdges.length);
  const linkArrows = renderedEdges.map(
    edge => (edge.arrowPlacement ?? edgeArrowPosition) !== 'none'
  );

  renderedEdges.forEach((edge, index) => {
    const selected = selectedIds.has(edge.id);
    const active = activeEdgeIds.has(edge.id);
    const colorActive = selected || active || colorActiveEdgeIds.has(edge.id);
    const style = getEdgeRenderStyle({
      edge,
      theme,
      active: selected || active,
      colorActive,
      hasSelections
    });

    setRgba(linkColors, index * 4, style.color, style.opacity);
    linkWidths[index] = edge.size ?? 1;
  });

  return {
    linkArrows,
    linkColors,
    links: new Float32Array(links),
    linkWidths,
    pointColors,
    pointPositions,
    pointSizes
  };
};
