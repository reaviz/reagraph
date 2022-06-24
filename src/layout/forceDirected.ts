import {
  forceSimulation as d3ForceSimulation,
  forceLink as d3ForceLink,
  forceManyBody as d3ForceManyBody,
  forceX as d3ForceX,
  forceY as d3ForceY,
  forceZ as d3ForceZ
} from 'd3-force-3d';
import { InternalGraphEdge, InternalGraphNode } from '../types';
import { forceRadial, DagMode } from './forceUtils';
import { LayoutStrategy } from './types';
import forceCluster from 'd3-force-cluster-3d';
import { group } from 'd3-array';

interface ForceDirectedD3Inputs {
  dimensions?: number;
  mode?: DagMode;
  graph: any;
  clusterAttribute?: string;
}

export function forceDirected({
  graph,
  mode = null,
  dimensions = 2,
  clusterAttribute
}: ForceDirectedD3Inputs): LayoutStrategy {
  const nodes: InternalGraphNode[] = [];
  const links: InternalGraphEdge[] = [];

  // Map the graph nodes / edges to D3 object
  graph.forEachNode(n => {
    nodes.push({
      ...n,
      // just trying to make the cluster work...
      radius: 5
    });
  });

  graph.forEachLink(l => {
    links.push({ ...l, id: l.data.id, source: l.fromId, target: l.toId });
  });

  const groups = group(nodes, n => n.data?.data?.[clusterAttribute]);
  const clusters = Array.from(groups, ([key]) => key);
  const clusterCount = clusters.length;

  console.log('>>>', clusters, clusterAttribute);
  const fakeWidth = 1200;
  const fakeHeight = 1200;

  // Create the simulation
  const sim = d3ForceSimulation()
    .force('link', d3ForceLink())
    .force('charge', d3ForceManyBody().strength(dimensions > 2 ? -500 : -250))
    .force('x', d3ForceX())
    .force('y', d3ForceY())
    .force('z', d3ForceZ())
    .force(
      'cluster',
      forceCluster()
        .centers(node => {
          const idx = clusters.indexOf(node.data?.data?.[clusterAttribute]);

          // This is wrong duh
          // https://bl.ocks.org/ericsoco/4e1b7b628771ae77753842e6dabfcef3
          const res = {
            z: 0,
            x:
              Math.cos((idx / clusterCount) * 2 * Math.PI) * 150 +
              fakeWidth / 2,
            y:
              Math.sin((idx / clusterCount) * 2 * Math.PI) * 150 +
              fakeHeight / 2
          };

          console.log('cluster', res, idx);

          return res;
        })
        .strength(0.5)
    )
    .force('dagRadial', forceRadial(nodes, links, mode as DagMode))
    .stop();

  // Initialize the simulation
  const layout = sim.numDimensions(dimensions).nodes(nodes);

  // Run the force on the links
  const linkForce = layout.force('link');
  if (linkForce) {
    linkForce
      .id(d => d.id)
      .links(links)
      .distance(50);
  }

  console.log('???', nodes);

  return {
    step() {
      // Run the ticker 100 times so
      // we don't overdo the animation
      sim.tick(100);
      return true;
    },
    getNodePosition(id: string) {
      return nodes.find(n => n.id === id);
    }
  };
}
