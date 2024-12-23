import Graph from 'graphology';
import { LayoutStrategy } from './types';
import { InternalGraphEdge, InternalGraphNode } from '../types';
/**
 * Promise based tick helper.
 */
export declare function tick(layout: LayoutStrategy): Promise<unknown>;
/**
 * Helper function to turn the graph nodes/edges into an array for
 * easier manipulation.
 */
export declare function buildNodeEdges(graph: Graph): {
    nodes: InternalGraphNode[];
    edges: InternalGraphEdge[];
};
