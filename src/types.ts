export interface GraphElementBaseAttributes<T = any> {
  id: string;
  data?: T;
  label?: string;
  size?: number;
  labelVisible?: boolean;
}

export interface GraphNode extends GraphElementBaseAttributes {
  icon?: string;
  color?: string;
}

export interface GraphEdge extends GraphElementBaseAttributes {
  source: string;
  target: string;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface InternalGraphLink {
  data: any;
  id: string;
  fromId: string;
  toId: string;
}

export interface InternalGraphEdgePosition {
  from: InternalGraphPosition;
  to: InternalGraphPosition;
}

export interface InternalGraphEdge
  extends Omit<GraphEdge, 'source' | 'target'> {
  from: InternalGraphNode;
  to: InternalGraphNode;
  fromId: string;
  toId: string;
  position: InternalGraphEdgePosition;
}

export interface InternalGraphPosition extends InternalVector3 {
  id: string;
  data: any;
  links: InternalGraphLink[];
  index: number;
  vx: number;
  vy: number;
}

export interface InternalVector3 {
  x: number;
  y: number;
  z: number;
}

export interface InternalGraphNode extends GraphNode {
  links: InternalGraphLink[];
  position: InternalGraphPosition;
}
