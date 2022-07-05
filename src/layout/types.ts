import { Graph } from 'ngraph.graph';
import { InternalGraphNode } from '../types';

export type LayoutTypes =
  | 'forceDirected2d'
  | 'forceDirected3d'
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
  clusterAttribute?: string;
  graph: Graph;
}

export interface LayoutStrategy {
  getNodePosition: (id: string) => InternalGraphNode;
  step: () => boolean | undefined;
}
