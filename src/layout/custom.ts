import Graph from 'graphology';
import { LayoutFactoryProps } from './types';
import { DragReferences } from 'store';
import {
  InternalGraphEdge,
  InternalGraphNode,
  InternalGraphPosition
} from '../types';

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

export interface CustomLayoutInputs extends Partial<LayoutFactoryProps> {
  /**
   * Get the node position for a given node id.
   */
  getNodePosition: (
    id: string,
    args: NodePositionArgs
  ) => InternalGraphPosition;
}

export function custom({ graph, drags, getNodePosition }: CustomLayoutInputs) {
  const nodes: InternalGraphNode[] = [];
  const edges: InternalGraphEdge[] = [];

  graph.forEachNode((id, n: any) => {
    nodes.push({
      ...n,
      id
    });
  });

  graph.forEachEdge((id, l: any) => {
    edges.push({ ...l, id });
  });

  return {
    step() {
      return true;
    },
    getNodePosition(id: string) {
      // If we dragged, we need to use that position
      return getNodePosition(id, { graph, drags, nodes, edges });
    }
  };
}
