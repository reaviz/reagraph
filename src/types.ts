import { ReactNode } from 'react';
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
}

export interface GraphEdge extends GraphElementBaseAttributes {
  /**
   * Source ID of the node.
   */
  source: string;

  /**
   * Target ID of the node.
   */
  target: string;
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
