import {
  forceSimulation as d3ForceSimulation,
  forceLink as d3ForceLink,
  forceManyBody as d3ForceManyBody,
  forceCenter as d3ForceCenter
} from 'd3-force-3d';
import { InternalGraphEdge, InternalGraphNode } from '../types';
import { forceRadial, DagMode } from './forceUtils';
import { LayoutStrategy } from './types';

interface ForceDirectedD3Inputs {
  dimensions?: number;
  mode?: DagMode;
  graph: any;
}

export function forceDirected({
  graph,
  mode = null,
  dimensions = 2
}: ForceDirectedD3Inputs): LayoutStrategy {
  const nodes: InternalGraphNode[] = [];
  const links: InternalGraphEdge[] = [];

  // Map the graph nodes / edges to D3 object
  graph.forEachNode(n => {
    nodes.push({ ...n });
  });

  graph.forEachLink(l => {
    links.push({ ...l, id: l.data.id, source: l.fromId, target: l.toId });
  });

  // Create the simulation
  const sim = d3ForceSimulation()
    .force('link', d3ForceLink())
    .force('charge', d3ForceManyBody().strength(dimensions > 2 ? -300 : -150))
    .force('center', d3ForceCenter())
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
