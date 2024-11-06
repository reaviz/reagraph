import {
  forceSimulation as d3ForceSimulation,
  forceLink as d3ForceLink,
  forceCollide,
  forceManyBody as d3ForceManyBody,
  forceX as d3ForceX,
  forceY as d3ForceY,
  forceZ as d3ForceZ,
  forceCenter as d3ForceCenter
} from 'd3-force-3d';
import { forceRadial, DagMode } from './forceUtils';
import { LayoutFactoryProps, LayoutStrategy } from './types';
import { buildNodeEdges } from './layoutUtils';
import { forceInABox } from './forceInABox';
import { FORCE_LAYOUTS } from './layoutProvider';
import { ClusterGroup } from '../utils/cluster';

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
   * The clusters dragged position to reuse for the layout.
   */
  clusters: Map<string, ClusterGroup>;

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
  clusters,
  clusterAttribute,
  forceLayout
}: ForceDirectedLayoutInputs): LayoutStrategy {
  const { nodes, edges } = buildNodeEdges(graph);

  // Dynamically adjust node strength based on the number of edges
  const is2d = dimensions === 2;
  const nodeStrengthAdjustment =
    is2d && edges.length > 25 ? nodeStrength * 2 : nodeStrength;

  let forceX;
  let forceY;
  if (forceLayout === 'forceDirected2d') {
    forceX = d3ForceX();
    forceY = d3ForceY();
  } else {
    forceX = d3ForceX(600).strength(0.05);
    forceY = d3ForceY(600).strength(0.05);
  }

  // Create the simulation
  const sim = d3ForceSimulation()
    .force('center', d3ForceCenter(0, 0))
    .force('link', d3ForceLink())
    .force('charge', d3ForceManyBody().strength(nodeStrengthAdjustment))
    .force('x', forceX)
    .force('y', forceY)
    .force('z', d3ForceZ())
    // Handles nodes not overlapping each other ( most relevant in clustering )
    .force(
      'collide',
      forceCollide(d => d.radius + 10)
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

  let groupingForce;
  if (clusterAttribute) {
    // Dynamically adjust cluster force charge based on the number of nodes
    let forceChargeAdjustment = forceCharge;
    if (nodes?.length) {
      const adjustmentFactor = Math.ceil(nodes.length / 200);
      forceChargeAdjustment = forceCharge * adjustmentFactor;
    }

    groupingForce = forceInABox()
      // The clusters dragged position to reuse for the layout
      .setClusters(clusters)
      // Strength to foci
      .strength(clusterStrength)
      // Either treemap or force
      .template(clusterType)
      // Node attribute to group
      .groupBy(d => d.data[clusterAttribute])
      // The graph links. Must be called after setting the grouping attribute
      .links(edges)
      // Size of the chart
      .size([100, 100])
      // linkStrength between nodes of different clusters
      .linkStrengthInterCluster(linkStrengthInterCluster)
      // linkStrength between nodes of the same cluster
      .linkStrengthIntraCluster(linkStrengthIntraCluster)
      // linkDistance between meta-nodes on the template (Force template only)
      .forceLinkDistance(forceLinkDistance)
      // linkStrength between meta-nodes of the template (Force template only)
      .forceLinkStrength(forceLinkStrength)
      // Charge between the meta-nodes (Force template only)
      .forceCharge(forceChargeAdjustment)
      // Used to compute the template force nodes size (Force template only)
      .forceNodeSize(d => d.radius);
  }

  // Initialize the simulation
  let layout = sim.numDimensions(dimensions).nodes(nodes);

  if (groupingForce) {
    layout = layout.force('group', groupingForce);
  }

  // Run the force on the links
  if (linkDistance) {
    let linkForce = layout.force('link');
    if (linkForce) {
      linkForce
        .id(d => d.id)
        .links(edges)
        // When no mode passed, its a tree layout
        // so let's use a larger distance
        .distance(linkDistance);

      if (groupingForce) {
        linkForce = linkForce.strength(groupingForce?.getLinkStrength ?? 0.1);
      }
    }
  }

  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  return {
    step() {
      // Run the simulation til we get a stable result
      while (sim.alpha() > 0.01) {
        sim.tick();
      }
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
