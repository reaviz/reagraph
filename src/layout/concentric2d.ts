import { LayoutFactoryProps, LayoutStrategy } from './types';
import { buildNodeEdges } from './layoutUtils';
import { InternalGraphNode, InternalGraphPosition } from '../types';
import Graph from 'graphology';

export interface ConcentricLayoutInputs extends LayoutFactoryProps {
  /**
   * Radius of the innermost circle.
   */
  minRadius?: number;
  /**
   * Radius of the outermost circle.
   */
  maxRadius?: number;
  /**
   * Center point of the layout.
   */
  center?: [number, number];
  /**
   * Whether to use degree centrality for positioning.
   */
  useDegreeCentrality?: boolean;
}

export function concentric2d({
  graph,
  drags,
  minRadius = 50,
  maxRadius = 300,
  center = [0, 0],
  useDegreeCentrality = true,
  getNodePosition
}: ConcentricLayoutInputs): LayoutStrategy {
  const { nodes, edges } = buildNodeEdges(graph);

  // Calculate degree centrality for each node
  const nodeDegrees = new Map<string, number>();

  nodes.forEach(node => {
    const degree = graph.degree(node.id);
    nodeDegrees.set(node.id, degree);
  });

  // Sort nodes by degree (descending) for centrality-based positioning
  const sortedNodes = [...nodes].sort((a, b) => {
    const degreeA = nodeDegrees.get(a.id) || 0;
    const degreeB = nodeDegrees.get(b.id) || 0;
    return degreeB - degreeA;
  });

  // Group nodes by degree or create concentric rings
  const rings: InternalGraphNode[][] = [];
  const maxDegree = Math.max(...nodeDegrees.values());
  const minDegree = Math.min(...nodeDegrees.values());

  if (useDegreeCentrality && maxDegree > minDegree) {
    // Create rings based on degree centrality
    const degreeRange = maxDegree - minDegree;
    const numRings = Math.min(5, degreeRange + 1); // Limit to 5 rings max

    for (let i = 0; i < numRings; i++) {
      rings[i] = [];
    }

    sortedNodes.forEach(node => {
      const degree = nodeDegrees.get(node.id) || 0;
      const ringIndex = Math.floor(
        ((degree - minDegree) / degreeRange) * (numRings - 1)
      );
      rings[ringIndex].push(node);
    });
  } else {
    // Fallback: distribute nodes evenly across rings
    const numRings = Math.min(5, Math.ceil(Math.sqrt(nodes.length)));
    const nodesPerRing = Math.ceil(nodes.length / numRings);

    for (let i = 0; i < numRings; i++) {
      rings[i] = sortedNodes.slice(i * nodesPerRing, (i + 1) * nodesPerRing);
    }
  }

  // Calculate positions for each node
  const nodePositions = new Map<string, InternalGraphPosition>();
  const [centerX, centerY] = center;

  rings.forEach((ringNodes, ringIndex) => {
    if (ringNodes.length === 0) return;

    const radius =
      minRadius + (ringIndex / (rings.length - 1)) * (maxRadius - minRadius);
    const angleStep = (2 * Math.PI) / ringNodes.length;

    ringNodes.forEach((node, nodeIndex) => {
      const angle = nodeIndex * angleStep;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      nodePositions.set(node.id, {
        ...node.position,
        x,
        y,
        z: 0
      });
    });
  });

  return {
    step() {
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

      return nodePositions.get(id);
    }
  };
}
