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
import { SharedPositionBuffer, SharedPositionConfig } from './shared-memory';
import { forceBarnesHut, selectOptimalMode } from '../layout/forces/barnesHutForce';
import { AdaptivePerformanceManager, PerformanceMetrics } from '../performance/AdaptivePerformanceManager';

// Re-export types for convenience
export type { WorkerNode, WorkerEdge, SimulationParams, PositionUpdate };

interface LayoutWorker {
  initialize(
    nodeCount: number,
    sharedBuffer?: SharedArrayBuffer,
    sharedConfig?: SharedPositionConfig
  ): Promise<void>;
  simulate(
    nodes: WorkerNode[],
    edges: WorkerEdge[],
    params: SimulationParams,
    nodeIdIndexMap?: Map<string, number>
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

  // SharedArrayBuffer support
  private sharedPositionBuffer?: SharedPositionBuffer;
  private useSharedMemory = false;
  private nodeIdToIndex = new Map<string, number>();
  
  // Adaptive performance management
  private performanceManager?: AdaptivePerformanceManager;
  private lastFrameTime = 0;
  private frameCount = 0;

  async initialize(
    nodeCount: number,
    onPositionUpdate: (positions: PositionUpdate[]) => void,
    sharedPositionBuffer?: SharedPositionBuffer,
    performanceManager?: AdaptivePerformanceManager
  ): Promise<void> {
    const bundlerEnv = detectBundlerEnvironment();
    console.log(`[LayoutManager] Detected bundler environment: ${bundlerEnv}`);

    this.onPositionUpdate = onPositionUpdate;
    this.sharedPositionBuffer = sharedPositionBuffer;
    this.useSharedMemory =
      !!sharedPositionBuffer && SharedPositionBuffer.isSupported();
    this.performanceManager = performanceManager;

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

        // Set up worker message handling
        this.setupWorkerMessageHandling();

        // Initialize worker with SharedArrayBuffer if available
        if (this.useSharedMemory && this.sharedPositionBuffer) {
          const sharedConfig: SharedPositionConfig = {
            nodeCount,
            enableVelocity: true,
            enableForces: true
          };

          await this.layoutWorker.initialize(
            nodeCount,
            this.sharedPositionBuffer.getSharedBuffer(),
            sharedConfig
          );
        } else {
          await this.layoutWorker.initialize(nodeCount);
        }

        this.initialized = true;

        console.log(
          `[LayoutManager] Worker initialized successfully using ${this.workerLoadResult.method} (SharedMemory: ${this.useSharedMemory})`
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

    // Build node ID to index mapping for SharedArrayBuffer
    this.nodeIdToIndex.clear();
    nodes.forEach((node, index) => {
      this.nodeIdToIndex.set(node.id, index);
    });

    try {
      if (this.layoutWorker) {
        console.log(
          '[LayoutManager] Calling worker simulate with',
          nodes.length,
          'nodes'
        );

        if (this.useSharedMemory) {
          await this.layoutWorker.simulate(
            nodes,
            edges,
            params,
            this.nodeIdToIndex
          );
        } else {
          await this.layoutWorker.simulate(nodes, edges, params);
        }

        console.log('[LayoutManager] Worker simulate completed');
      } else {
        console.log('[LayoutManager] Using main thread fallback');
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
      // Remove message listener before terminating
      this.worker.removeEventListener('message', this.handleWorkerMessage);
      this.worker.terminate();
      this.worker = null;
    }

    this.layoutWorker = null;
    this.initialized = false;
    this.onPositionUpdate = null;
  }

  private setupWorkerMessageHandling(): void {
    if (!this.worker) return;

    // Add event listener for worker messages
    this.worker.addEventListener('message', this.handleWorkerMessage);
  }

  private handleWorkerMessage = (event: MessageEvent): void => {
    const { type, data } = event.data;

    switch (type) {
    case 'positionUpdate':
      if (this.onPositionUpdate && data) {
        this.onPositionUpdate(data as PositionUpdate[]);
      }
      break;
    case 'sharedPositionUpdate':
      // Handle SharedArrayBuffer updates - positions are already updated in shared memory
      // We just need to notify that an update occurred
      if (this.useSharedMemory && this.sharedPositionBuffer) {
        this.handleSharedMemoryUpdate(data);
      }
      break;
    case 'simulationStopped':
      console.log('[LayoutManager] Worker simulation stopped', data);
      this.isSimulationRunning = false;
      break;
    default:
      // Ignore other message types (from Comlink)
      break;
    }
  };

  private handleSharedMemoryUpdate(data: {
    tickCount: number;
    alpha: number;
  }): void {
    // With SharedArrayBuffer, positions are already updated in shared memory
    // No need to copy data, just trigger a re-render by calling the callback
    // Convert shared buffer positions to PositionUpdate format if needed
    if (this.onPositionUpdate && this.sharedPositionBuffer) {
      const positions: PositionUpdate[] = [];

      // Convert shared memory positions to callback format
      this.nodeIdToIndex.forEach((index, nodeId) => {
        const pos = this.sharedPositionBuffer!.getPosition(index);
        if (pos) {
          positions.push({
            nodeId,
            x: pos.x,
            y: pos.y,
            z: pos.z
          });
        }
      });

      this.onPositionUpdate(positions);
    }
  }

  private initializeMainThreadFallback(nodeCount: number): void {
    console.log('[LayoutManager] Initializing main thread fallback layout');

    // Determine optimal force based on node count
    const optimalMode = selectOptimalMode(nodeCount);
    const useBarnesHut = optimalMode.mode === 'barnesHut' && optimalMode.location === 'mainThread';
    
    // Get adaptive performance settings if available
    const performanceSettings = this.performanceManager?.getPerformanceSettings();
    const adaptiveTheta = performanceSettings?.barnesHutTheta || optimalMode.theta || 0.5;
    
    console.log(
      `[LayoutManager] Using ${useBarnesHut ? 'Barnes-Hut' : 'standard'} force for ${nodeCount} nodes (${optimalMode.reason}), theta: ${adaptiveTheta}`
    );

    // Create a basic D3 simulation for fallback
    this.fallbackSimulation = forceSimulation()
      .force('center', forceCenter(0, 0))
      .force('charge', useBarnesHut 
        ? forceBarnesHut(adaptiveTheta).strength(-250)
        : forceManyBody().strength(-250))
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
    
    // Track performance metrics
    const currentTime = performance.now();
    const frameTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;
    this.frameCount++;
    
    // Update performance manager every 10 frames
    if (this.performanceManager && this.frameCount % 10 === 0) {
      const fps = frameTime > 0 ? 1000 / frameTime : 60;
      const metrics: PerformanceMetrics = {
        fps,
        frameTime,
        nodeCount: this.fallbackNodes.length,
        edgeCount: this.fallbackEdges.length
      };
      this.performanceManager.updateMetrics(metrics);
      
      // Apply adaptive theta if using Barnes-Hut
      const chargeForce = this.fallbackSimulation?.force('charge');
      if (chargeForce && 'theta' in chargeForce) {
        const settings = this.performanceManager.getPerformanceSettings();
        (chargeForce as any).theta(settings.barnesHutTheta);
      }
    }

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
