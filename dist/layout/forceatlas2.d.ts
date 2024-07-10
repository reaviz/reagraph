import { LayoutFactoryProps } from './types';
export interface ForceAtlas2LayoutInputs extends LayoutFactoryProps {
    /**
     * Should the node’s sizes be taken into account. Default: false.
     */
    adjustSizes?: boolean;
    /**
     * whether to use the Barnes-Hut approximation to compute
     * repulsion in O(n*log(n)) rather than default O(n^2),
     * n being the number of nodes. Default: false.
     */
    barnesHutOptimize?: boolean;
    /**
     * Barnes-Hut approximation theta parameter. Default: 0.5.
     */
    barnesHutTheta?: number;
    /**
     * Influence of the edge’s weights on the layout. To consider edge weight, don’t
     *  forget to pass weighted as true. Default: 1.
     */
    edgeWeightInfluence?: number;
    /**
     * Strength of the layout’s gravity. Default: 10.
     */
    gravity?: number;
    /**
     * Whether to use Noack’s LinLog model. Default: false.
     */
    linLogMode?: boolean;
    /**
     * Whether to consider edge weights when calculating repulsion. Default: false.
     */
    outboundAttractionDistribution?: boolean;
    /**
     * Scaling ratio for repulsion. Default: 100.
     */
    scalingRatio?: number;
    /**
     * Speed of the slowdown. Default: 1.
     */
    slowDown?: number;
    /**
     * Whether to use the strong gravity mode. Default: false.
     */
    strongGravityMode?: boolean;
    /**
     * Number of iterations to perform. Default: 50.
     */
    iterations?: number;
}
export declare function forceAtlas2({ graph, drags, iterations, ...rest }: ForceAtlas2LayoutInputs): {
    step(): boolean;
    getNodePosition(id: string): any;
};
