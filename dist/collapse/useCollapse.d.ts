import { GraphEdge, GraphNode } from 'types';
export interface UseCollapseProps {
    /**
     * Current collapsed node ids.
     */
    collapsedNodeIds?: string[];
    /**
     * Node data.
     */
    nodes?: GraphNode[];
    /**
     * Edge data.
     */
    edges?: GraphEdge[];
}
export interface CollpaseResult {
    /**
     * Determine if a node is currently collapsed
     */
    getIsCollapsed: (nodeId: string) => boolean;
    /**
     * Return a list of ids required to expand in order to view the provided node
     */
    getExpandPathIds: (nodeId: string) => string[];
}
export declare const useCollapse: ({ collapsedNodeIds, nodes, edges }: UseCollapseProps) => CollpaseResult;
