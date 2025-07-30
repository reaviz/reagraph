import { ReactNode } from 'react';
import { Theme } from './themes';
import { ColorRepresentation } from 'three';

export interface GraphElementBaseAttributes<T = any> {
  /**
   * ID of the element.
   */
  id: string;

  /**
   * Extra data associated with the element.
   */
  data?: T;

  /**
   * Label for the element.
   */
  label?: string;

  /**
   * SubLabel for the element.
   */
  subLabel?: string;

  /**
   * Size of the element.
   */
  size?: number;

  /**
   * Force label visible or not.
   */
  labelVisible?: boolean;
}

export interface GraphNode extends GraphElementBaseAttributes {
  /**
   * ID of the parent node.
   */
  parents?: string[];

  /**
   * Icon URL for the node.
   */
  icon?: string;

  /**
   * Fill color for the node.
   */
  fill?: string;

  /**
   * Cluster ID for the node.
   */
  cluster?: string;

  /**
   * Fixed X position for force-directed layouts.
   * When set, the node will be pinned to this X coordinate.
   */
  fx?: number;

  /**
   * Fixed Y position for force-directed layouts.
   * When set, the node will be pinned to this Y coordinate.
   */
  fy?: number;

  /**
   * Fixed Z position for force-directed layouts.
   * When set, the node will be pinned to this Z coordinate.
   */
  fz?: number;
}

export interface GraphEdge extends GraphElementBaseAttributes {
  /**
   * Source ID of the node.
   */
  source: string;

  /**
   * Fill color for the edge.
   */
  fill?: string;

  /**
   * Target ID of the node.
   */
  target: string;

  /**
   * Whether the edge should be rendered with a dashed line pattern.
   * When true, the edge will display with alternating dash and gap segments.
   * Default is false (solid line).
   */
  dashed?: boolean;

  /**
   * Placement of the subLabel relative to the main label.
   * - 'below': Show subLabel below the main label (default)
   * - 'above': Show subLabel above the main label
   */
  subLabelPlacement?: 'below' | 'above';

  /**
   * Type of edge interpolation.
   * - 'linear': Straight line
   * - 'curved': Curved line
   */
  interpolation?: 'linear' | 'curved';

  /**
   * Placement of the edge arrow.
   * - 'none': No arrow
   * - 'mid': Arrow in the middle of the edge
   * - 'end': Arrow at the end of the edge
   */
  arrowPlacement?: 'none' | 'mid' | 'end';
}

export interface Graph {
  /**
   * Public nodes of the graph.
   */
  nodes: GraphNode[];

  /**
   * Public edges of the graph.
   */
  edges: GraphEdge[];
}

export interface InternalGraphLink {
  /**
   * Extra data associated with the element.
   */
  data: any;

  /**
   * ID of the edge.
   */
  id: string;

  /**
   * ID of the from node.
   */
  source: string;

  /**
   * ID of the to node.
   */
  target: string;
}

export interface InternalGraphEdge
  extends Omit<GraphEdge, 'source' | 'target'> {
  /**
   * ID of the from node.
   */
  source: string;

  /**
   * ID of the to node.
   */
  target: string;
}

export interface InternalGraphPosition extends InternalVector3 {
  /**
   * ID of the element.
   */
  id: string;

  /**
   * Extra data associated with the element.
   */
  data: any;

  /**
   * Link relationships of the element.
   */
  links: InternalGraphLink[];

  /**
   * Index of the element.
   */
  index: number;

  /**
   * VX position of the element.
   */
  vx: number;

  /**
   * VY position of the element.
   */
  vy: number;
}

export interface InternalVector3 {
  /**
   * X position of the element.
   */
  x: number;

  /**
   * Y position of the element.
   */
  y: number;

  /**
   * Z position of the element.
   */
  z: number;
}

export interface InternalGraphNode extends GraphNode {
  /**
   * Position of the node set by dragging or layout.
   */
  position: InternalGraphPosition;

  /**
   * FX position of the element. This is used for the force graph layout.
   */
  fx?: number;

  /**
   * FY position of the element. This is used for the force graph layout.
   */
  fy?: number;

  /**
   * FZ position of the element. This is used for the force graph layout.
   */
  fz?: number;
}

export interface CollapseProps {
  /**
   * Whether a node can be collapsed based on if it has any outbound edges
   */
  canCollapse: boolean;

  /**
   * Whether a node has been collapsed via a context menu action
   */
  isCollapsed: boolean;
}

export interface NodeContextMenuProps extends CollapseProps {
  /**
   * Callback to hide a node's ancestors which are not accessible via another node's edges
   */
  onCollapse: () => void;
}

export interface ContextMenuEvent extends NodeContextMenuProps {
  /**
   * Data the node was invoked on.
   */
  data: InternalGraphNode | InternalGraphEdge;

  /**
   * Close event callback.
   */
  onClose: () => void;
}

export interface NodeRendererProps {
  /**
   * Color of the node. Handles selected/etc.
   */
  color: ColorRepresentation;

  /**
   * The internal node model.
   */
  node: InternalGraphNode;

  /**
   * Size of the node.
   */
  size: number;

  /**
   * Whether the node is active or not.
   */
  active: boolean;

  /**
   * Whether the node is selected or not.
   */
  selected: boolean;

  /**
   * Opacity of the node. Mainly used for selection.
   */
  opacity: number;

  /**
   * Animation of the node.
   */
  animated: boolean;

  /**
   * ID of the node.
   */
  id: string;
}

export type NodeRenderer = (args: NodeRendererProps) => ReactNode;

export interface ClusterLabel {
  /**
   * Position of the label.
   */
  position: [number, number, number];

  /**
   * Text of the label.
   */
  text: string;

  /**
   * Opacity of the label.
   */
  opacity?: number;

  /**
   * Font URL of the label.
   */
  fontUrl?: string;
}

export interface ClusterRendererProps {
  /**
   * Outer radius of the cluster.
   */
  outerRadius: number;

  /**
   * Inner radius of the cluster.
   */
  innerRadius: number;

  /**
   * Padding of the cluster.
   */
  padding: number;

  /**
   * Opacity of the cluster.
   */
  opacity: number;

  /**
   * Label of the cluster.
   */
  label?: ClusterLabel;

  /**
   * Theme of the graph.
   */
  theme?: Theme;
}

export type ClusterRenderer = (args: ClusterRendererProps) => ReactNode;
