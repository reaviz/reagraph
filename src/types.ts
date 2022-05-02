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
