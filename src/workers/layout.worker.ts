/**
 * Web Worker for running layout calculations off the main thread.
 * This prevents layout calculations from blocking UI interactions.
 */

import {
  forceCenter as d3ForceCenter,
  forceCollide,
  forceLink as d3ForceLink,
  forceManyBody as d3ForceManyBody,
  forceSimulation as d3ForceSimulation,
  forceX as d3ForceX,
  forceY as d3ForceY,
  forceZ as d3ForceZ
} from 'd3-force-3d';

// Note: We can't import forceRadial and forceInABox here as they have complex dependencies
// that don't work in the worker context. For now, we use a simplified force layout.

type DagMode = 'lr' | 'rl' | 'td' | 'bu' | 'radialin' | 'radialout' | null;

// Worker message types
export type LayoutWorkerMessageIn =
  | {
      type: 'CALCULATE_LAYOUT';
      id: number;
      layoutType: string;
      nodes: WorkerNode[];
      edges: WorkerEdge[];
      options: LayoutWorkerOptions;
    }
  | {
      type: 'CANCEL';
      id: number;
    };

export type LayoutWorkerMessageOut =
  | {
      type: 'LAYOUT_COMPLETE';
      id: number;
      positions: Map<string, WorkerPosition>;
    }
  | {
      type: 'LAYOUT_PROGRESS';
      id: number;
      progress: number;
    }
  | {
      type: 'LAYOUT_ERROR';
      id: number;
      error: string;
    }
  | {
      type: 'LAYOUT_CANCELLED';
      id: number;
    };

export interface WorkerNode {
  id: string;
  data?: Record<string, any>;
  radius?: number;
  // Pre-existing drag position
  dragPosition?: WorkerPosition;
}

export interface WorkerEdge {
  id: string;
  source: string;
  target: string;
}

export interface WorkerPosition {
  x: number;
  y: number;
  z?: number;
}

export interface LayoutWorkerOptions {
  dimensions?: number;
  nodeStrength?: number;
  linkDistance?: number;
  clusterStrength?: number;
  clusterAttribute?: string;
  clusterType?: 'force' | 'treemap';
  mode?: DagMode;
  nodeLevelRatio?: number;
  linkStrengthInterCluster?: number;
  linkStrengthIntraCluster?: number;
  forceLinkDistance?: number;
  forceLinkStrength?: number;
  forceCharge?: number;
  forceLayout?: string;
  // Serialized cluster positions for reuse
  clusterPositions?: Record<string, WorkerPosition>;
}

// Track current calculation for cancellation
let currentCalculationId: number | null = null;

/**
 * Run force-directed layout calculation
 * Note: This is a simplified version that doesn't support clustering or DAG modes
 * since those have complex dependencies. For full features, use main-thread layout.
 */
function calculateForceDirectedLayout(
  nodes: WorkerNode[],
  edges: WorkerEdge[],
  options: LayoutWorkerOptions
): Map<string, WorkerPosition> {
  const {
    dimensions = 2,
    nodeStrength = -250,
    linkDistance = 50,
    forceLayout = 'forceDirected2d'
  } = options;

  // Prepare nodes with radius for simulation
  const simNodes = nodes.map(node => ({
    id: node.id,
    data: node.data || {},
    radius: node.radius || 5,
    // Use drag position if available
    x: node.dragPosition?.x,
    y: node.dragPosition?.y,
    z: node.dragPosition?.z
  }));

  // Prepare edges for simulation
  const simEdges = edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target
  }));

  // Dynamically adjust node strength based on the number of edges
  const is2d = dimensions === 2;
  const nodeStrengthAdjustment =
    is2d && simEdges.length > 25 ? nodeStrength * 2 : nodeStrength;

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
    .force(
      'collide',
      forceCollide((d: any) => d.radius + 10)
    )
    .stop();

  // Initialize the simulation
  const layout = sim.numDimensions(dimensions).nodes(simNodes);

  // Run the force on the links
  if (linkDistance) {
    const linkForce = layout.force('link');
    if (linkForce) {
      linkForce
        .id((d: any) => d.id)
        .links(simEdges)
        .distance(linkDistance);
    }
  }

  // Run the simulation until stable
  while (sim.alpha() > 0.01) {
    sim.tick();
  }

  // Extract positions
  const positions = new Map<string, WorkerPosition>();
  simNodes.forEach(node => {
    positions.set(node.id, {
      x: (node as any).x || 0,
      y: (node as any).y || 0,
      z: (node as any).z || 0
    });
  });

  return positions;
}

/**
 * Simple circular layout (synchronous, fast)
 */
function calculateCircularLayout(
  nodes: WorkerNode[]
): Map<string, WorkerPosition> {
  const positions = new Map<string, WorkerPosition>();
  const count = nodes.length;
  const radius = Math.max(100, count * 10);

  nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / count;
    positions.set(node.id, {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
      z: 0
    });
  });

  return positions;
}

/**
 * Main message handler
 */
self.onmessage = (event: MessageEvent<LayoutWorkerMessageIn>) => {
  const message = event.data;

  switch (message.type) {
    case 'CALCULATE_LAYOUT': {
      currentCalculationId = message.id;

      try {
        let positions: Map<string, WorkerPosition>;

        // Route to appropriate layout algorithm
        if (
          message.layoutType === 'forceDirected2d' ||
          message.layoutType === 'forceDirected3d' ||
          message.layoutType === 'treeTd2d' ||
          message.layoutType === 'treeTd3d' ||
          message.layoutType === 'treeLr2d' ||
          message.layoutType === 'treeLr3d' ||
          message.layoutType === 'radialOut2d' ||
          message.layoutType === 'radialOut3d'
        ) {
          positions = calculateForceDirectedLayout(
            message.nodes,
            message.edges,
            {
              ...message.options,
              forceLayout: message.layoutType,
              dimensions: message.layoutType.includes('3d') ? 3 : 2
            }
          );
        } else if (message.layoutType === 'circular2d') {
          positions = calculateCircularLayout(message.nodes);
        } else {
          // Default to force-directed for unknown types
          positions = calculateForceDirectedLayout(
            message.nodes,
            message.edges,
            message.options
          );
        }

        // Only send result if not cancelled
        if (currentCalculationId === message.id) {
          // Convert Map to array for postMessage (Maps don't serialize well)
          const positionsArray = Array.from(positions.entries());

          self.postMessage({
            type: 'LAYOUT_COMPLETE',
            id: message.id,
            positions: positionsArray
          });
        }
      } catch (error) {
        self.postMessage({
          type: 'LAYOUT_ERROR',
          id: message.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      currentCalculationId = null;
      break;
    }

    case 'CANCEL': {
      if (currentCalculationId === message.id) {
        currentCalculationId = null;
        self.postMessage({
          type: 'LAYOUT_CANCELLED',
          id: message.id
        });
      }
      break;
    }
  }
};

// Export empty object to make this a module (required for TypeScript)
export {};
