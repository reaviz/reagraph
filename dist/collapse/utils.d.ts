import { GraphEdge, GraphNode } from '../types';
interface GetVisibleIdsInput {
    collapsedIds: string[];
    nodes: GraphNode[];
    edges: GraphEdge[];
}
interface GetExpandPathInput {
    nodeId: string;
    edges: GraphEdge[];
    visibleEdgeIds: string[];
}
/**
 * Get the visible nodes and edges given a collapsed set of ids.
 */
export declare const getVisibleEntities: ({ collapsedIds, nodes, edges }: GetVisibleIdsInput) => {
    visibleNodes: GraphNode[];
    visibleEdges: GraphEdge[];
};
/**
 * Get the path to expand a node.
 */
export declare const getExpandPath: ({ nodeId, edges, visibleEdgeIds }: GetExpandPathInput) => any[];
export {};
