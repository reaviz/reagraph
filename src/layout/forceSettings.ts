import { InternalGraphNode, InternalGraphEdge } from '../types';

interface ForceSettingsInputs {
  nodes: InternalGraphNode[];
  edges: InternalGraphEdge[];
  height: number;
  width: number;
}

export function optimizeGraphLayout({
  nodes,
  edges,
  height,
  width
}: ForceSettingsInputs) {
  const numNodes = nodes.length;

  // More repulsive with fewer nodes
  const chargeStrength = -40 * Math.log(numNodes);

  // Adjust based on graph size and node count
  const linkDistance =
    Math.min(width, height) / Math.max(10, Math.sqrt(numNodes));

  // Prevent overlap, adjustable based on node count
  const collideRadius = Math.max(5, 10 - Math.log(numNodes));

  /*
  // Create the simulation with the adjusted parameters
  const simulation = forceSimulation()
    .force("link", forceLink().id((d: any) => d.id).distance(linkDistance))
    .force("charge", forceManyBody().strength(chargeStrength))
    .force("center", forceCenter()width / 2, height / 2)
    .force("collide", forceCollide(collideRadius));
  */

  return {
    linkDistance,
    chargeStrength,
    collideRadius,
    center: [width / 2, height / 2]
  };
}
