import { InternalGraphNode } from '../types';

export type LayoutTypes =
  | 'forceDirected2d'
  | 'forceDirected3d'
  | 'hierarchical'
  | 'circular2d'
  | 'treeTd2d'
  | 'treeTd3d'
  | 'treeLr2d'
  | 'treeLr3d'
  | 'radialOut2d'
  | 'radialOut3d'
  | 'hierarchicalTd'
  | 'hierarchicalLr';

export interface LayoutFactoryProps {
  type: LayoutTypes;
  graph: any;
}

export interface LayoutStrategy {
  getNodePosition: (id: string) => InternalGraphNode;
  step: () => boolean | undefined;
}
