import { expose } from 'comlink';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  Simulation
} from 'd3-force-3d';

export interface WorkerNode {
  id: string;
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  fx?: number | null;
  fy?: number | null;
  fz?: number | null;
  radius?: number;
  mass?: number;
}

export interface WorkerEdge {
  id: string;
  source: string | WorkerNode;
  target: string | WorkerNode;
  distance?: number;
  strength?: number;
}

export interface SimulationParams {
  alpha?: number;
  alphaDecay?: number;
  alphaMin?: number;
  velocityDecay?: number;
  center?: { x: number; y: number; z?: number };
  manyBodyStrength?: number;
  linkDistance?: number;
  linkStrength?: number;
  collideRadius?: number;
  collideStrength?: number;
}

export interface PositionUpdate {
  nodeId: string;
  x: number;
  y: number;
  z: number;
}

class LayoutWorker {
  private simulation: Simulation<WorkerNode, WorkerEdge> | null = null;
  private nodes: WorkerNode[] = [];
  private edges: WorkerEdge[] = [];
  private isRunning = false;
  private tickCount = 0;
  private maxTicks = 300;
  private onPositionUpdate: ((positions: PositionUpdate[]) => void) | null =
    null;

  async initialize(
    nodeCount: number,
    onPositionUpdate: (positions: PositionUpdate[]) => void
  ): Promise<void> {
    console.log(`[LayoutWorker] Initializing for ${nodeCount} nodes`);

    this.onPositionUpdate = onPositionUpdate;

    // Create simulation with default forces
    this.simulation = forceSimulation<WorkerNode, WorkerEdge>()
      .force('center', forceCenter(0, 0, 0))
      .force('charge', forceManyBody<WorkerNode>().strength(-250))
      .force(
        'link',
        forceLink<WorkerNode, WorkerEdge>().id(d => d.id)
      )
      .force(
        'collide',
        forceCollide<WorkerNode>(d => (d.radius || 5) + 1)
      )
      .on('tick', () => {
        if (this.isRunning && this.onPositionUpdate) {
          this.handleTick();
        }
      })
      .stop();

    console.log('[LayoutWorker] Simulation initialized');
  }

  async simulate(
    nodes: WorkerNode[],
    edges: WorkerEdge[],
    params: SimulationParams = {}
  ): Promise<void> {
    if (!this.simulation) {
      throw new Error('Worker not initialized');
    }

    console.log(
      `[LayoutWorker] Starting simulation with ${nodes.length} nodes and ${edges.length} edges`
    );

    // Store references
    this.nodes = nodes;
    this.edges = edges;
    this.isRunning = true;
    this.tickCount = 0;

    // Apply simulation parameters
    this.applySimulationParams(params);

    // Set nodes and edges
    this.simulation.nodes(this.nodes);

    const linkForce = this.simulation.force<any>('link');
    if (linkForce) {
      linkForce.links(this.edges);
    }

    // Start simulation
    this.simulation.alpha(params.alpha || 1).restart();

    console.log('[LayoutWorker] Simulation started');
  }

  private applySimulationParams(params: SimulationParams): void {
    if (!this.simulation) return;

    // Configure center force
    if (params.center) {
      const centerForce = this.simulation.force<any>('center');
      if (centerForce) {
        centerForce.x(params.center.x).y(params.center.y);
        if (params.center.z !== undefined) {
          centerForce.z(params.center.z);
        }
      }
    }

    // Configure many-body force
    if (params.manyBodyStrength !== undefined) {
      const chargeForce = this.simulation.force<any>('charge');
      if (chargeForce) {
        chargeForce.strength(params.manyBodyStrength);
      }
    }

    // Configure link force
    const linkForce = this.simulation.force<any>('link');
    if (linkForce) {
      if (params.linkDistance !== undefined) {
        linkForce.distance(params.linkDistance);
      }
      if (params.linkStrength !== undefined) {
        linkForce.strength(params.linkStrength);
      }
    }

    // Configure collision force
    if (
      params.collideRadius !== undefined ||
      params.collideStrength !== undefined
    ) {
      const collideForce = this.simulation.force<any>('collide');
      if (collideForce) {
        if (params.collideRadius !== undefined) {
          collideForce.radius(params.collideRadius);
        }
        if (params.collideStrength !== undefined) {
          collideForce.strength(params.collideStrength);
        }
      }
    }

    // Configure simulation parameters
    if (params.alphaDecay !== undefined) {
      this.simulation.alphaDecay(params.alphaDecay);
    }
    if (params.alphaMin !== undefined) {
      this.simulation.alphaMin(params.alphaMin);
    }
    if (params.velocityDecay !== undefined) {
      this.simulation.velocityDecay(params.velocityDecay);
    }
  }

  private handleTick(): void {
    this.tickCount++;

    // Send position updates
    const positions: PositionUpdate[] = this.nodes.map(node => ({
      nodeId: node.id,
      x: node.x || 0,
      y: node.y || 0,
      z: node.z || 0
    }));

    if (this.onPositionUpdate) {
      this.onPositionUpdate(positions);
    }

    // Check stopping conditions
    const alpha = this.simulation?.alpha() || 0;
    if (this.tickCount >= this.maxTicks || alpha < 0.01) {
      this.stop();
    }
  }

  async updateNodePositions(
    nodeUpdates: {
      nodeId: string;
      x?: number;
      y?: number;
      z?: number;
      fx?: number | null;
      fy?: number | null;
      fz?: number | null;
    }[]
  ): Promise<void> {
    nodeUpdates.forEach(update => {
      const node = this.nodes.find(n => n.id === update.nodeId);
      if (node) {
        if (update.x !== undefined) node.x = update.x;
        if (update.y !== undefined) node.y = update.y;
        if (update.z !== undefined) node.z = update.z;
        if (update.fx !== undefined) node.fx = update.fx;
        if (update.fy !== undefined) node.fy = update.fy;
        if (update.fz !== undefined) node.fz = update.fz;
      }
    });

    // Reheat simulation slightly
    if (this.simulation && this.isRunning) {
      this.simulation.alpha(Math.max(0.1, this.simulation.alpha()));
    }
  }

  async setMaxTicks(maxTicks: number): Promise<void> {
    this.maxTicks = maxTicks;
  }

  async getProgress(): Promise<{
    progress: number;
    alpha: number;
    tickCount: number;
  }> {
    return {
      progress: this.maxTicks > 0 ? this.tickCount / this.maxTicks : 0,
      alpha: this.simulation?.alpha() || 0,
      tickCount: this.tickCount
    };
  }

  stop(): void {
    console.log(
      `[LayoutWorker] Stopping simulation after ${this.tickCount} ticks`
    );
    this.isRunning = false;
    if (this.simulation) {
      this.simulation.stop();
    }
  }

  async isSimulationRunning(): Promise<boolean> {
    return this.isRunning;
  }
}

expose(new LayoutWorker());
