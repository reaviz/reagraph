import { InternalGraphNode } from '../types';

export type LayoutTypes =
  | 'forceDirected2d'
  | 'forceDirected3d'
  | 'circular2d'
  | 'treeTd3d'
  | 'treeLr3d'
  | 'radialOut3d';

export interface LayoutFactoryProps {
  type: LayoutTypes;
  graph: any;
}

export interface LayoutStrategy {
  getNodePosition: (id: string) => InternalGraphNode;
  step: () => boolean | undefined;
}
