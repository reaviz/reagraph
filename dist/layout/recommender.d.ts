import { GraphEdge, GraphNode } from '../types';
import { LayoutTypes } from './types';
/**
 * Given a set of nodes and edges, determine the type of layout that
 * is most ideal. This is very beta.
 */
export declare function recommendLayout(nodes: GraphNode[], edges: GraphEdge[]): LayoutTypes;
