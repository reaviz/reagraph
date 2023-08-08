import { DragReferences } from '../store';
import {
  InternalGraphEdge,
  InternalGraphNode,
  InternalGraphPosition
} from '../types';
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
  | 'forceatlas2'
  | 'custom';

export interface NodePositionArgs {
  /**
   * The graphology object. Useful for any graph manipulation.
   */
  graph: Graph;

  /**
   * Any nodes that were dragged. This is useful if you want to override
   * the position of a node when dragged.
   */
  drags?: DragReferences;

  /**
   * The nodes for the graph.
   */
  nodes: InternalGraphNode[];

  /**
   * The edges for the graph.
   */
  edges: InternalGraphEdge[];
}

export interface LayoutFactoryProps {
  /**
   * The type of layout to use.
   */
  type: LayoutTypes;

  /**
   * The cluster attribute to use.
   */
  clusterAttribute?: string;

  /**
   * The graph object.
   */
  graph: Graph;

  /**
   * Dragged node position refs.
   */
  drags?: DragReferences;

  /**
   * Get the node position for a given node id.
   */
  getNodePosition: (
    id: string,
    args: NodePositionArgs
  ) => InternalGraphPosition;
}

export interface LayoutStrategy {
  /**
   * Given a node, get the position. If dragged, will fallback to drag position.
   */
  getNodePosition: (id: string) => InternalGraphPosition;

  /**
   * Async stepper.
   */
  step: () => boolean | undefined;
}
