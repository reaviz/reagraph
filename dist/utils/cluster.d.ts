import { InternalGraphNode } from '../types';
import { CenterPositionVector } from './layout';
/**
 * Given nodes and a attribute, find all the cluster groups.
 */
export declare function buildClusterGroups(nodes: InternalGraphNode[], clusterAttribute?: string): Map<any, any>;
export interface CalculateClustersInput {
    /**
     * The nodes to calculate clusters for.
     */
    nodes: InternalGraphNode[];
    /**
     * The attribute to use for clustering.
     */
    clusterAttribute?: string;
}
export interface ClusterGroup {
    /**
     * Nodes in the cluster.
     */
    nodes: InternalGraphNode[];
    /**
     * Center position of the cluster.
     */
    position: CenterPositionVector;
    /**
     * Label of the cluster.
     */
    label: string;
}
/**
 * Builds the cluster map.
 *
 * This function:
 *  - Builds the cluster groups
 *  - Calculates the center position of each cluster group
 *  - Creates a cluster object for each group
 */
export declare function calculateClusters({ nodes, clusterAttribute }: CalculateClustersInput): Map<string, ClusterGroup>;
