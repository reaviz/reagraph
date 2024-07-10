import { InternalGraphNode } from '../types';
import { CenterPositionVector } from './layout';
/**
 * Given nodes and a attribute, find all the cluster groups.
 */
export declare function buildClusterGroups(nodes: InternalGraphNode[], clusterAttribute?: string): Map<any, any>;
export interface CalculateClustersInput {
    nodes: InternalGraphNode[];
    clusterAttribute?: string;
}
export interface ClusterGroup {
    nodes: InternalGraphNode[];
    position: CenterPositionVector;
    label: string;
}
/**
 * Builds the cluster map.
 */
export declare function calculateClusters({ nodes, clusterAttribute }: CalculateClustersInput): Map<string, ClusterGroup>;
