import { DagMode } from './forceUtils';
import { LayoutFactoryProps, LayoutStrategy } from './types';
import { FORCE_LAYOUTS } from './layoutProvider';
export interface ForceDirectedLayoutInputs extends LayoutFactoryProps {
    /**
     * Center inertia for the layout. Default: 1.
     */
    centerInertia?: number;
    /**
     * Number of dimensions for the layout. 2d or 3d.
     */
    dimensions?: number;
    /**
     * Mode for the dag layout. Only applicable for dag layouts.
     */
    mode?: DagMode;
    /**
     * Distance between links.
     */
    linkDistance?: number;
    /**
     * Strength of the node repulsion.
     */
    nodeStrength?: number;
    /**
     * Strength of the cluster repulsion.
     */
    clusterStrength?: number;
    /**
     * The type of clustering.
     */
    clusterType?: 'force' | 'treemap';
    /**
     * Ratio of the distance between nodes on the same level.
     */
    nodeLevelRatio?: number;
    /**
     * LinkStrength between nodes of different clusters
     */
    linkStrengthInterCluster?: number | ((d: any) => number);
    /**
     * LinkStrength between nodes of the same cluster
     */
    linkStrengthIntraCluster?: number | ((d: any) => number);
    /**
     * Charge between the meta-nodes (Force template only)
     */
    forceLinkDistance?: number;
    /**
     * Used to compute the template force nodes size (Force template only)
     */
    forceLinkStrength?: number;
    /**
     * Used to compute the template force nodes size (Force template only)
     */
    forceCharge?: number;
    /**
     * Used to determine the simulation forceX and forceY values
     */
    forceLayout: (typeof FORCE_LAYOUTS)[number];
}
export declare function forceDirected({ graph, nodeLevelRatio, mode, dimensions, nodeStrength, linkDistance, clusterStrength, linkStrengthInterCluster, linkStrengthIntraCluster, forceLinkDistance, forceLinkStrength, clusterType, forceCharge, getNodePosition, drags, clusterAttribute, forceLayout }: ForceDirectedLayoutInputs): LayoutStrategy;
