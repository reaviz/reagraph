import { wrap, Remote } from 'comlink';
import {
  createWorker,
  WorkerLoadResult,
  detectBundlerEnvironment
} from './worker-loader';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide
} from 'd3-force-3d';
import type {
  WorkerNode,
  WorkerEdge,
  SimulationParams,
  PositionUpdate
} from './layout.worker';

// Re-export types for convenience
export type { WorkerNode, WorkerEdge, SimulationParams, PositionUpdate };

interface LayoutWorker {
  initialize(
    nodeCount: number,
    onPositionUpdate: (positions: PositionUpdate[]) => void
  ): Promise<void>;
  simulate(
    nodes: WorkerNode[],
    edges: WorkerEdge[],
    params: SimulationParams
  ): Promise<void>;
  updateNodePositions(
    nodeUpdates: {
      nodeId: string;
      x?: number;
      y?: number;
      z?: number;
      fx?: number | null;
      fy?: number | null;
      fz?: number | null;
    }[]
  ): Promise<void>;
  setMaxTicks(maxTicks: number): Promise<void>;
  getProgress(): Promise<{
    progress: number;
    alpha: number;
    tickCount: number;
  }>;
  stop(): void;
  isSimulationRunning(): Promise<boolean>;
}

export interface LayoutManagerStatus {
  initialized: boolean;
  workerAvailable: boolean;
  loadMethod?: string;
  error?: string;
  bundlerEnvironment: string;
  isSimulationRunning: boolean;
}

export class LayoutManager {
  private worker: Worker | null = null;
  private layoutWorker: Remote<LayoutWorker> | null = null;
  private workerLoadResult: WorkerLoadResult | null = null;
  private initialized = false;
  private isSimulationRunning = false;
  private fallbackSimulation: any = null;
  private fallbackNodes: WorkerNode[] = [];
  private fallbackEdges: WorkerEdge[] = [];
  private onPositionUpdate: ((positions: PositionUpdate[]) => void) | null =
    null;

  async initialize(
    nodeCount: number,
    onPositionUpdate: (positions: PositionUpdate[]) => void
  ): Promise<void> {
    const bundlerEnv = detectBundlerEnvironment();
    console.log(`[LayoutManager] Detected bundler environment: ${bundlerEnv}`);

    this.onPositionUpdate = onPositionUpdate;

    try {
      // Attempt to load worker using robust loading strategy
      this.workerLoadResult = await createWorker({
        workerName: 'layout.worker',
        basePath: './workers',
        debug: true
      });

      if (this.workerLoadResult.worker) {
        // Success - initialize worker
        this.worker = this.workerLoadResult.worker;
        this.layoutWorker = wrap<LayoutWorker>(this.worker);
        await this.layoutWorker.initialize(nodeCount, onPositionUpdate);
        this.initialized = true;

        console.log(
          `[LayoutManager] Worker initialized successfully using ${this.workerLoadResult.method}`
        );
      } else {
        throw new Error(
          `Worker loading failed: ${this.workerLoadResult.error?.message}`
        );
      }
    } catch (error) {
      console.warn(
        '[LayoutManager] Worker initialization failed, falling back to main thread:',
        error
      );
      // Fallback to main thread implementation
      this.initializeMainThreadFallback(nodeCount);
    }
  }

  async simulate(
    nodes: WorkerNode[],
    edges: WorkerEdge[],
    params: SimulationParams = {}
  ): Promise<void> {
    this.isSimulationRunning = true;

    try {
      if (this.layoutWorker) {
        await this.layoutWorker.simulate(nodes, edges, params);
      } else {
        // Main thread fallback
        return this.simulateMainThread(nodes, edges, params);
      }
    } catch (error) {
      console.error('[LayoutManager] Simulation failed:', error);
      this.isSimulationRunning = false;
      throw error;
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
    if (this.layoutWorker) {
      await this.layoutWorker.updateNodePositions(nodeUpdates);
    } else {
      // Update fallback simulation
      nodeUpdates.forEach(update => {
        const node = this.fallbackNodes.find(n => n.id === update.nodeId);
        if (node) {
          if (update.x !== undefined) node.x = update.x;
          if (update.y !== undefined) node.y = update.y;
          if (update.z !== undefined) node.z = update.z;
          if (update.fx !== undefined) node.fx = update.fx;
          if (update.fy !== undefined) node.fy = update.fy;
          if (update.fz !== undefined) node.fz = update.fz;
        }
      });

      if (this.fallbackSimulation) {
        this.fallbackSimulation.alpha(
          Math.max(0.1, this.fallbackSimulation.alpha())
        );
      }
    }
  }

  async setMaxTicks(maxTicks: number): Promise<void> {
    if (this.layoutWorker) {
      await this.layoutWorker.setMaxTicks(maxTicks);
    }
    // For fallback, we don't need to do anything as it runs to completion
  }

  async getProgress(): Promise<{
    progress: number;
    alpha: number;
    tickCount: number;
  }> {
    if (this.layoutWorker) {
      return await this.layoutWorker.getProgress();
    } else {
      return {
        progress: this.fallbackSimulation
          ? this.fallbackSimulation.alpha() < 0.01
            ? 1
            : 0.5
          : 0,
        alpha: this.fallbackSimulation?.alpha() || 0,
        tickCount: 0
      };
    }
  }

  async stop(): Promise<void> {
    this.isSimulationRunning = false;

    if (this.layoutWorker) {
      this.layoutWorker.stop();
    } else if (this.fallbackSimulation) {
      this.fallbackSimulation.stop();
    }
  }

  async isRunning(): Promise<boolean> {
    if (this.layoutWorker) {
      return await this.layoutWorker.isSimulationRunning();
    }
    return this.isSimulationRunning;
  }

  getStatus(): LayoutManagerStatus {
    return {
      initialized: this.initialized,
      workerAvailable: this.worker !== null,
      loadMethod: this.workerLoadResult?.method,
      error: this.workerLoadResult?.error?.message,
      bundlerEnvironment: detectBundlerEnvironment(),
      isSimulationRunning: this.isSimulationRunning
    };
  }

  dispose(): void {
    this.stop();

    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    this.layoutWorker = null;
    this.initialized = false;
    this.onPositionUpdate = null;
  }

  private initializeMainThreadFallback(nodeCount: number): void {
    console.log('[LayoutManager] Initializing main thread fallback layout');

    // Create a basic D3 simulation for fallback
    this.fallbackSimulation = forceSimulation()
      .force('center', forceCenter(0, 0))
      .force('charge', forceManyBody().strength(-250))
      .force(
        'link',
        forceLink().id((d: any) => d.id)
      )
      .force(
        'collide',
        forceCollide((d: any) => (d.radius || 5) + 1)
      )
      .on('tick', () => {
        if (this.onPositionUpdate && this.fallbackNodes.length > 0) {
          this.handleFallbackTick();
        }
      })
      .stop();

    this.initialized = true;
  }

  private handleFallbackTick(): void {
    if (!this.onPositionUpdate) return;

    const positions: PositionUpdate[] = this.fallbackNodes.map(node => ({
      nodeId: node.id,
      x: node.x || 0,
      y: node.y || 0,
      z: node.z || 0
    }));

    this.onPositionUpdate(positions);

    // Check if simulation has cooled down
    if (this.fallbackSimulation && this.fallbackSimulation.alpha() < 0.01) {
      this.isSimulationRunning = false;
      this.fallbackSimulation.stop();
    }
  }

  private simulateMainThread(
    nodes: WorkerNode[],
    edges: WorkerEdge[],
    params: SimulationParams = {}
  ): Promise<void> {
    return new Promise(resolve => {
      console.log('[LayoutManager] Running simulation on main thread');

      this.fallbackNodes = nodes;
      this.fallbackEdges = edges;

      if (!this.fallbackSimulation) {
        this.initializeMainThreadFallback(nodes.length);
      }

      // Apply parameters to fallback simulation
      this.applyFallbackParams(params);

      // Set nodes and edges
      this.fallbackSimulation
        .nodes(this.fallbackNodes)
        .force('link')
        .links(this.fallbackEdges);

      // Set up completion handler
      this.fallbackSimulation.on('end', () => {
        this.isSimulationRunning = false;
        resolve();
      });

      // Start simulation
      this.fallbackSimulation.alpha(params.alpha || 1).restart();
    });
  }

  private applyFallbackParams(params: SimulationParams): void {
    if (!this.fallbackSimulation) return;

    // Configure center force
    if (params.center) {
      const centerForce = this.fallbackSimulation.force('center');
      if (centerForce) {
        centerForce.x(params.center.x).y(params.center.y);
      }
    }

    // Configure many-body force
    if (params.manyBodyStrength !== undefined) {
      const chargeForce = this.fallbackSimulation.force('charge');
      if (chargeForce) {
        chargeForce.strength(params.manyBodyStrength);
      }
    }

    // Configure link force
    const linkForce = this.fallbackSimulation.force('link');
    if (linkForce) {
      if (params.linkDistance !== undefined) {
        linkForce.distance(params.linkDistance);
      }
      if (params.linkStrength !== undefined) {
        linkForce.strength(params.linkStrength);
      }
    }

    // Configure simulation parameters
    if (params.alphaDecay !== undefined) {
      this.fallbackSimulation.alphaDecay(params.alphaDecay);
    }
    if (params.alphaMin !== undefined) {
      this.fallbackSimulation.alphaMin(params.alphaMin);
    }
    if (params.velocityDecay !== undefined) {
      this.fallbackSimulation.velocityDecay(params.velocityDecay);
    }
  }
}
