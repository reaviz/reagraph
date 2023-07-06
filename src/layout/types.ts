import { DragReferences } from '../store';
import { InternalGraphPosition } from '../types';
import Graph from 'graphology';

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
  | 'hierarchicalLr'
  | 'nooverlap'
  | 'forceatlas2';

export interface LayoutFactoryProps {
  type: LayoutTypes;
  clusterAttribute?: string;
  graph: Graph;
  drags?: DragReferences;
}

export interface LayoutStrategy {
  getNodePosition: (id: string) => InternalGraphPosition;
  step: () => boolean | undefined;
}
