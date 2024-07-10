import { InternalGraphEdge, InternalGraphNode } from '../types';
export interface DepthNode {
    data: InternalGraphNode;
    ins: DepthNode[];
    out: DepthNode[];
    depth: number;
}
/**
 * Gets the depth of the graph's nodes. Used in the radial layout.
 */
export declare function getNodeDepth(nodes: InternalGraphNode[], links: InternalGraphEdge[]): {
    invalid: boolean;
    depths: {
        [key: string]: DepthNode;
    };
    maxDepth: number;
};
