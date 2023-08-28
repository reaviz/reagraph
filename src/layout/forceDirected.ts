import {
  forceSimulation as d3ForceSimulation,
  forceLink as d3ForceLink,
  forceCollide,
  forceManyBody as d3ForceManyBody,
  forceX as d3ForceX,
  forceY as d3ForceY,
  forceZ as d3ForceZ
} from 'd3-force-3d';
import { forceRadial, DagMode } from './forceUtils';
import { LayoutFactoryProps, LayoutStrategy } from './types';
import { buildNodeEdges } from './layoutUtils';
import { forceInABox } from './forceInABox';

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
}

const TICK_COUNT = 100;

export function forceDirected({
  graph,
  nodeLevelRatio = 2,
  mode = null,
  dimensions = 2,
  nodeStrength = -250,
  linkDistance = 50,
  clusterStrength = 0.5,
  linkStrengthInterCluster = 0.01,
  linkStrengthIntraCluster = 0.5,
  forceLinkDistance = 100,
  forceLinkStrength = 0.1,
  clusterType = 'force',
  forceCharge = -700,
  getNodePosition,
  drags,
  clusterAttribute
}: ForceDirectedLayoutInputs): LayoutStrategy {
  const { nodes, edges } = buildNodeEdges(graph);

  // Dynamically adjust node strength based on the number of edges
  const is2d = dimensions === 2;
  const nodeStrengthAdjustment =
    is2d && edges.length > 25 ? nodeStrength * 2 : nodeStrength;

  // Create the simulation
  const sim = d3ForceSimulation()
    .force('link', d3ForceLink())
    .force('charge', d3ForceManyBody().strength(nodeStrengthAdjustment))
    .force('x', d3ForceX(1200 / 2).strength(0.05))
    .force('y', d3ForceY(1200 / 2).strength(0.05))
    .force('z', d3ForceZ())
    // Handles nodes not overlapping each other ( most relevant in clustering )
    .force(
      'collide',
      forceCollide(d => d.radius)
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

  let groupingForce = forceInABox()
    // Strength to foci
    .strength(clusterStrength)
    // Either treemap or force
    .template(clusterType)
    // Node attribute to group
    .groupBy(d => d.data[clusterAttribute])
    // The graph links. Must be called after setting the grouping attribute
    .links(edges)
    // Size of the chart
    .size([1155, 791])
    // linkStrength between nodes of different clusters
    .linkStrengthInterCluster(linkStrengthInterCluster)
    // linkStrength between nodes of the same cluster
    .linkStrengthIntraCluster(linkStrengthIntraCluster)
    // linkDistance between meta-nodes on the template (Force template only)
    .forceLinkDistance(forceLinkDistance)
    // linkStrength between meta-nodes of the template (Force template only)
    .forceLinkStrength(forceLinkStrength)
    // Charge between the meta-nodes (Force template only)
    .forceCharge(forceCharge)
    // Used to compute the template force nodes size (Force template only)
    .forceNodeSize(d => d.radius);

  // Initialize the simulation
  const layout = sim
    .numDimensions(dimensions)
    .nodes(nodes)
    .force('group', groupingForce);

  // Run the force on the links
  if (linkDistance) {
    const linkForce = layout.force('link');
    if (linkForce) {
      linkForce
        .id(d => d.id)
        .links(edges)
        // When no mode passed, its a tree layout
        // so let's use a larger distance
        .distance(linkDistance)
        .strength(groupingForce.getLinkStrength);
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
      if (getNodePosition) {
        const pos = getNodePosition(id, { graph, drags, nodes, edges });
        if (pos) {
          return pos;
        }
      }

      if (drags?.[id]?.position) {
        // If we dragged, we need to use that position
        return drags?.[id]?.position as any;
      }

      return nodeMap.get(id);
    }
  };
}
