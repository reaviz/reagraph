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
  /**
   * Spacing between rings.
   */
  spacingFactor?: number;
  /**
   * Whether to start angle from the top (12 o'clock position).
   */
  startAngle?: number;
}

export function concentric2d({
  graph,
  drags,
  minRadius = 50,
  maxRadius = 300,
  center = [0, 0],
  useDegreeCentrality = true,
  spacingFactor = 1.25,
  startAngle = 0,
  getNodePosition
}: ConcentricLayoutInputs): LayoutStrategy {
  const { nodes, edges } = buildNodeEdges(graph);

  if (nodes.length === 0) {
    return {
      step() {
        return true;
      },
      getNodePosition() {
        return {
          x: 0,
          y: 0,
          z: 0,
          id: '',
          data: {},
          links: [],
          index: 0,
          vx: 0,
          vy: 0
        };
      }
    };
  }

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

  // Determine number of rings and assign nodes to rings
  const rings: InternalGraphNode[][] = [];
  const degreeValues = Array.from(nodeDegrees.values());
  const maxDegree = Math.max(...degreeValues);
  const minDegree = Math.min(...degreeValues);

  if (useDegreeCentrality && maxDegree > minDegree) {
    // Create rings based on degree centrality
    const degreeRange = maxDegree - minDegree;
    const numRings = Math.min(5, degreeRange + 1);

    // Initialize rings
    for (let i = 0; i < numRings; i++) {
      rings[i] = [];
    }

    // Assign nodes to rings based on degree
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

  // Filter out empty rings
  const nonEmptyRings = rings.filter(ring => ring.length > 0);

  // Calculate positions for each node
  const nodePositions = new Map<string, InternalGraphPosition>();
  const [centerX, centerY] = center;

  nonEmptyRings.forEach((ringNodes, ringIndex) => {
    // Calculate radius with spacing factor
    const radius =
      minRadius +
      (ringIndex * spacingFactor * (maxRadius - minRadius)) /
        (nonEmptyRings.length - 1);

    // Distribute nodes evenly around the circle
    ringNodes.forEach((node, nodeIndex) => {
      const angle = startAngle + (2 * Math.PI * nodeIndex) / ringNodes.length;
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
