import { GraphNode } from '../types';

export type LayoutTypes =
  | 'forceDirected2d'
  | 'forceDirected3d'
  | 'circular2d'
  | 'treeTd'
  | 'treeLr'
  | 'radialOut';

export interface LayoutFactoryProps {
  type: LayoutTypes;
  graph: any;
}

export interface LayoutNode extends GraphNode {
  x: number;
  y: number;
}

export interface LayoutStrategy {
  getNodePosition: (id: string) => LayoutNode;
  step: () => boolean | undefined;
}
