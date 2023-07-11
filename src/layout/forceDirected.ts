import {
  forceSimulation as d3ForceSimulation,
  forceLink as d3ForceLink,
  forceCollide,
  forceManyBody as d3ForceManyBody,
  forceX as d3ForceX,
  forceY as d3ForceY,
  forceZ as d3ForceZ
} from 'd3-force-3d';
import { InternalGraphEdge, InternalGraphNode } from '../types';
import { forceRadial, DagMode, caluculateCenters } from './forceUtils';
import { LayoutFactoryProps, LayoutStrategy } from './types';
import forceCluster from 'd3-force-cluster-3d';

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
   * Padding between clusters.
   */
  clusterPadding?: number;

  /**
   * Strength of the cluster repulsion.
   */
  clusterStrength?: number;

  /**
   * Ratio of the distance between nodes on the same level.
   */
  nodeLevelRatio?: number;
}

const TICK_COUNT = 100;

export function forceDirected({
  graph,
  nodeLevelRatio = 2,
  mode = null,
  dimensions = 2,
  nodeStrength = -250,
  linkDistance = 50,
  centerInertia = 1,
  clusterPadding = 10,
  clusterStrength = 0.5,
  drags,
  clusterAttribute
}: ForceDirectedLayoutInputs): LayoutStrategy {
  const nodes: InternalGraphNode[] = [];
  const edges: InternalGraphEdge[] = [];

  graph.forEachNode((id, n: any) => {
    nodes.push({
      ...n,
      id,
      // This is for the clustering
      radius: n.size || 1
    });
  });

  graph.forEachEdge((id, l: any) => {
    edges.push({ ...l, id });
  });

  // Dynamically adjust node strength based on the number of edges
  const is2d = dimensions === 2;
  const nodeStrengthAdjustment =
    is2d && edges.length > 25 ? nodeStrength * 2 : nodeStrength;

  // Create the simulation
  const sim = d3ForceSimulation()
    .force('link', d3ForceLink())
    .force('charge', d3ForceManyBody().strength(nodeStrengthAdjustment))
    .force('x', d3ForceX())
    .force('y', d3ForceY())
    .force('z', d3ForceZ())
    // Handles nodes not overlapping each other ( most relevant in clustering )
    .force(
      'collide',
      forceCollide(d => d.radius + clusterPadding)
    )
    .force(
      'dagRadial',
      forceRadial({
        nodes,
        edges,
        mode,
        nodeLevelRatio
      })
    )
    .stop();

  const centers = caluculateCenters(nodes, clusterAttribute);

  // Initialize the simulation
  const layout = sim
    .numDimensions(dimensions)
    .nodes(nodes)
    .force(
      'cluster',
      forceCluster()
        .centers(node => {
          // Happens after nodes passed so they have the x/y/z
          if (clusterAttribute) {
            const nodeClusterAttr = node?.data?.[clusterAttribute];
            return centers.get(nodeClusterAttr);
          }
        })
        .centerInertia(centerInertia)
        .strength(clusterStrength)
    );

  // Run the force on the links
  if (linkDistance && !clusterAttribute) {
    const linkForce = layout.force('link');
    if (linkForce) {
      linkForce
        .id(d => d.id)
        .links(edges)
        // When no mode passed, its a tree layout
        // so let's use a larger distance
        .distance(linkDistance);
    }
  }

  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  return {
    step() {
      // Run the ticker 100 times so
      // we don't overdo the animation
      sim.tick(TICK_COUNT);
      return true;
    },
    getNodePosition(id: string) {
      // If we dragged, we need to use that position
      return (drags?.[id]?.position as any) || nodeMap.get(id);
    }
  };
}
