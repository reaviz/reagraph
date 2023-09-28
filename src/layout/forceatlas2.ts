import forceAtlas2Layout from 'graphology-layout-forceatlas2';
import { LayoutFactoryProps } from './types';
import random from 'graphology-layout/random.js';

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

export function forceAtlas2({
  graph,
  drags,
  iterations,
  ...rest
}: ForceAtlas2LayoutInputs) {
  // Note: We need to assign a random position to each node
  // in order for the force atlas to work.
  // Reference: https://graphology.github.io/standard-library/layout-forceatlas2.html#pre-requisites
  random.assign(graph);

  const layout = forceAtlas2Layout(graph, {
    iterations,
    settings: rest
  });

  return {
    step() {
      return true;
    },
    getNodePosition(id: string) {
      // If we dragged, we need to use that position
      return (drags?.[id]?.position as any) || layout?.[id];
    }
  };
}
