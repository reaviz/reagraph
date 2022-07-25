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
  fromId: string;

  /**
   * ID of the to node.
   */
  toId: string;
}

export interface InternalGraphEdge
  extends Omit<GraphEdge, 'source' | 'target'> {
  /**
   * ID of the from node.
   */
  fromId: string;

  /**
   * ID of the to node.
   */
  toId: string;
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
   * Link relationships of the element.
   */
  links: InternalGraphLink[];

  /**
   * Position of the node set by dragging or layout.
   */
  position: InternalGraphPosition;

  /**
   * FX position of the element.
   */
  fx?: number;

  /**
   * FY position of the element.
   */
  fy?: number;

  /**
   * FZ position of the element.
   */
  fz?: number;
}

export interface ContextMenuEvent {
  /**
   * Data the node was invoked on.
   */
  data: InternalGraphNode | InternalGraphEdge;

  /**
   * Close event callback.
   */
  onClose: () => void;
}
