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
import { forceRadial, DagMode } from './forceUtils';
import { LayoutFactoryProps, LayoutStrategy } from './types';
import forceCluster from 'd3-force-cluster-3d';

export interface ForceDirectedD3Inputs extends LayoutFactoryProps {
  dimensions?: number;
  mode?: DagMode;
}

const CLUSTER_PADDING = 10;

export function forceDirected({
  graph,
  mode = null,
  dimensions = 2,
  drags,
  clusterAttribute
}: ForceDirectedD3Inputs): LayoutStrategy {
  const nodes: InternalGraphNode[] = [];
  const links: InternalGraphEdge[] = [];
  const cluster = new Map();

  // Map the graph nodes / edges to D3 object
  graph.forEachNode(n => {
    // @ts-ignore
    nodes.push({
      ...n,
      // This is for the clustering
      radius: n.data?.size || 1
    });
  });

  graph.forEachLink(l => {
    // @ts-ignore
    links.push({ ...l, id: l.data.id, source: l.fromId, target: l.toId });
  });

  // Create the simulation
  const sim = d3ForceSimulation()
    .force('link', d3ForceLink())
    .force('charge', d3ForceManyBody().strength(dimensions > 2 ? -500 : -250))
    .force('x', d3ForceX())
    .force('y', d3ForceY())
    .force('z', d3ForceZ())
    // Handles nodes not overlapping each other ( most relevant in clustering )
    .force(
      'collide',
      forceCollide(d => d.radius + CLUSTER_PADDING)
    )
    .force('dagRadial', forceRadial(nodes, links, mode as DagMode))
    .stop();

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
            const nodeClusterAttr = node.data?.data?.[clusterAttribute];
            const centerNode = cluster.get(nodeClusterAttr);

            if (!centerNode) {
              const largestNode = nodes.reduce((last: any, cur: any) => {
                if (cur.data?.data?.[clusterAttribute] === nodeClusterAttr) {
                  return cur.radius > last.radius ? cur : last;
                }
                return last;
              }, node);

              cluster.set(nodeClusterAttr, largestNode);
              return largestNode;
            }

            return centerNode;
          }
        })
        .strength(0.5)
    );

  // Run the force on the links
  const linkForce = layout.force('link');
  if (linkForce) {
    linkForce
      .id(d => d.id)
      .links(links)
      .distance(50);
  }

  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  return {
    step() {
      // Run the ticker 100 times so
      // we don't overdo the animation
      sim.tick(100);
      return true;
    },
    getNodePosition(id: string) {
      return drags?.[id] || nodeMap.get(id);
    }
  };
}
