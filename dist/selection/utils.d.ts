import { Theme } from '../themes';
import Graph from 'graphology';
export type PathSelectionTypes = 'direct' | 'out' | 'in' | 'all';
/**
 * Given a graph and a list of node ids, return the adjacent nodes and edges.
 *
 * TODO: This method could be improved with the introduction of graphology
 */
export declare function getAdjacents(graph: Graph, nodeIds: string | string[], type: PathSelectionTypes): {
    nodes: string[];
    edges: string[];
};
/**
 * Set the vectors.
 */
export declare function prepareRay(event: any, vec: any, size: any): void;
/**
 * Create a lasso element.
 */
export declare function createElement(theme: Theme): HTMLDivElement;
