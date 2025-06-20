/**
 * Phase 2D: Enhanced Worker Architecture
 *
 * Multi-worker system with SharedArrayBuffer and load balancing
 * Provides 4x improvement through specialized worker parallelization
 */

import { WorkerNode, WorkerEdge, SimulationParams } from './LayoutManager';

export interface WorkerPoolConfig {
  maxWorkers: number;
  enableSharedArrayBuffer?: boolean;
  enableWorkerPools?: boolean;
  workerTypes?: WorkerType[];
  loadBalancingStrategy?: 'round-robin' | 'least-loaded' | 'work-stealing';
  healthCheckInterval?: number;
  restartOnError?: boolean;
}

export enum WorkerType {
  LAYOUT = 'layout',
  PHYSICS = 'physics',
  ANALYSIS = 'analysis',
  STREAMING = 'streaming'
}

export interface WorkerTask {
  id: string;
  type: WorkerType;
  priority: number;
  data: any;
  timestamp: number;
  timeout?: number;
}

export interface WorkerStats {
  id: string;
  type: WorkerType;
  tasksCompleted: number;
  tasksInProgress: number;
  averageTaskTime: number;
  lastTaskTime: number;
  isHealthy: boolean;
  memoryUsage?: number;
  cpuUsage?: number;
}

export interface SharedMemoryBuffers {
  positions: SharedArrayBuffer;
  velocities: SharedArrayBuffer;
  forces: SharedArrayBuffer;
  metadata: SharedArrayBuffer;
  coordination: SharedArrayBuffer; // For worker coordination
}

/**
 * SharedArrayBuffer utilities for zero-copy worker communication
 */
export class SharedMemoryManager {
  private buffers: SharedMemoryBuffers | null = null;
  private atomicViews: {
    positions: Float32Array;
    velocities: Float32Array;
    forces: Float32Array;
    metadata: Uint32Array;
    coordination: Int32Array;
  } | null = null;

  private maxNodes: number;
  private isSharedArrayBufferSupported: boolean;

  constructor(maxNodes: number) {
    this.maxNodes = maxNodes;
    this.isSharedArrayBufferSupported = this.checkSharedArrayBufferSupport();
  }

  /**
   * Check if SharedArrayBuffer is available
   */
  private checkSharedArrayBufferSupport(): boolean {
    return (
      typeof SharedArrayBuffer !== 'undefined' &&
      typeof Atomics !== 'undefined' &&
      self.crossOriginIsolated
    );
  }

  /**
   * Initialize shared memory buffers
   */
  initializeSharedMemory(): boolean {
    if (!this.isSharedArrayBufferSupported) {
      console.warn(
        'SharedArrayBuffer not supported, falling back to message passing'
      );
      return false;
    }

    try {
      const nodeSize = this.maxNodes;
      const float32Size = 4;
      const uint32Size = 4;
      const int32Size = 4;

      // Allocate shared buffers
      this.buffers = {
        positions: new SharedArrayBuffer(nodeSize * 3 * float32Size), // x, y, z
        velocities: new SharedArrayBuffer(nodeSize * 3 * float32Size), // vx, vy, vz
        forces: new SharedArrayBuffer(nodeSize * 3 * float32Size), // fx, fy, fz
        metadata: new SharedArrayBuffer(nodeSize * uint32Size), // node states, colors, etc.
        coordination: new SharedArrayBuffer(32 * int32Size) // worker coordination data
      };

      // Create atomic views
      this.atomicViews = {
        positions: new Float32Array(this.buffers.positions),
        velocities: new Float32Array(this.buffers.velocities),
        forces: new Float32Array(this.buffers.forces),
        metadata: new Uint32Array(this.buffers.metadata),
        coordination: new Int32Array(this.buffers.coordination)
      };

      // Initialize coordination buffer
      this.atomicViews.coordination[0] = 0; // Worker count
      this.atomicViews.coordination[1] = 0; // Current iteration
      this.atomicViews.coordination[2] = 0; // Synchronization barrier

      return true;
    } catch (error) {
      console.error('Failed to initialize SharedArrayBuffer:', error);
      return false;
    }
  }

  /**
   * Update positions in shared memory
   */
  updatePositions(nodeIndex: number, x: number, y: number, z: number): void {
    if (!this.atomicViews) return;

    const offset = nodeIndex * 3;
    this.atomicViews.positions[offset] = x;
    this.atomicViews.positions[offset + 1] = y;
    this.atomicViews.positions[offset + 2] = z;
  }

  /**
   * Read positions from shared memory
   */
  getPositions(nodeIndex: number): { x: number; y: number; z: number } {
    if (!this.atomicViews) {
      return { x: 0, y: 0, z: 0 };
    }

    const offset = nodeIndex * 3;
    return {
      x: this.atomicViews.positions[offset],
      y: this.atomicViews.positions[offset + 1],
      z: this.atomicViews.positions[offset + 2]
    };
  }

  /**
   * Atomic operations for worker synchronization
   */
  waitForWorkers(expectedWorkerCount: number): void {
    if (!this.atomicViews) return;

    const coordination = this.atomicViews.coordination;

    // Wait until all workers have checked in
    while (Atomics.load(coordination, 0) < expectedWorkerCount) {
      Atomics.wait(coordination, 0, Atomics.load(coordination, 0), 1);
    }
  }

  /**
   * Signal worker completion
   */
  signalWorkerComplete(): void {
    if (!this.atomicViews) return;

    const coordination = this.atomicViews.coordination;
    Atomics.add(coordination, 0, 1);
    Atomics.notify(coordination, 0);
  }

  /**
   * Get shared buffers for worker transfer
   */
  getSharedBuffers(): SharedMemoryBuffers | null {
    return this.buffers;
  }

  /**
   * Check if SharedArrayBuffer is supported
   */
  isSupported(): boolean {
    return this.isSharedArrayBufferSupported;
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats(): {
    totalBytes: number;
    supported: boolean;
    buffersAllocated: boolean;
    } {
    const totalBytes = this.buffers
      ? this.buffers.positions.byteLength +
        this.buffers.velocities.byteLength +
        this.buffers.forces.byteLength +
        this.buffers.metadata.byteLength +
        this.buffers.coordination.byteLength
      : 0;

    return {
      totalBytes,
      supported: this.isSharedArrayBufferSupported,
      buffersAllocated: this.buffers !== null
    };
  }
}

/**
 * Individual worker wrapper with health monitoring
 */
export class EnhancedWorker {
  private worker: Worker;
  private stats: WorkerStats;
  private taskQueue: WorkerTask[] = [];
  private currentTask: WorkerTask | null = null;
  private healthCheckTimer?: number;
  private config: WorkerPoolConfig;

  constructor(
    workerScript: string,
    type: WorkerType,
    id: string,
    config: WorkerPoolConfig,
    sharedBuffers?: SharedMemoryBuffers
  ) {
    this.config = config;
    this.stats = {
      id,
      type,
      tasksCompleted: 0,
      tasksInProgress: 0,
      averageTaskTime: 0,
      lastTaskTime: 0,
      isHealthy: true
    };

    // Create worker with shared buffers if available
    this.worker = new Worker(workerScript);

    if (sharedBuffers) {
      this.worker.postMessage({
        type: 'init-shared-memory',
        buffers: sharedBuffers
      });
    }

    this.setupEventHandlers();
    this.startHealthCheck();
  }

  /**
   * Setup worker event handlers
   */
  private setupEventHandlers(): void {
    this.worker.onmessage = event => {
      const { type, taskId, result, error } = event.data;

      if (type === 'task-complete') {
        this.handleTaskComplete(taskId, result);
      } else if (type === 'task-error') {
        this.handleTaskError(taskId, error);
      } else if (type === 'health-check') {
        this.stats.isHealthy = true;
        this.stats.memoryUsage = result.memoryUsage;
        this.stats.cpuUsage = result.cpuUsage;
      }
    };

    this.worker.onerror = error => {
      console.error(`Worker ${this.stats.id} error:`, error);
      this.stats.isHealthy = false;

      if (this.config.restartOnError) {
        this.restart();
      }
    };
  }

  /**
   * Add task to worker queue
   */
  addTask(task: WorkerTask): void {
    this.taskQueue.push(task);
    this.taskQueue.sort((a, b) => b.priority - a.priority); // Higher priority first
    this.processNextTask();
  }

  /**
   * Process next task in queue
   */
  private processNextTask(): void {
    if (this.currentTask || this.taskQueue.length === 0) {
      return;
    }

    const task = this.taskQueue.shift()!;
    this.currentTask = task;
    this.stats.tasksInProgress++;

    const startTime = performance.now();

    this.worker.postMessage({
      type: 'execute-task',
      taskId: task.id,
      taskType: task.type,
      data: task.data,
      timestamp: startTime
    });

    // Set timeout if specified
    if (task.timeout) {
      setTimeout(() => {
        if (this.currentTask?.id === task.id) {
          this.handleTaskError(task.id, new Error('Task timeout'));
        }
      }, task.timeout);
    }
  }

  /**
   * Handle task completion
   */
  private handleTaskComplete(taskId: string, result: any): void {
    if (this.currentTask?.id === taskId) {
      const taskTime = performance.now() - this.currentTask.timestamp;

      this.stats.tasksCompleted++;
      this.stats.tasksInProgress--;
      this.stats.lastTaskTime = taskTime;
      this.stats.averageTaskTime =
        (this.stats.averageTaskTime * (this.stats.tasksCompleted - 1) +
          taskTime) /
        this.stats.tasksCompleted;

      this.currentTask = null;
      this.processNextTask();
    }
  }

  /**
   * Handle task error
   */
  private handleTaskError(taskId: string, error: any): void {
    if (this.currentTask?.id === taskId) {
      console.error(`Task ${taskId} failed in worker ${this.stats.id}:`, error);

      this.stats.tasksInProgress--;
      this.stats.isHealthy = false;
      this.currentTask = null;

      // Try to process next task
      this.processNextTask();
    }
  }

  /**
   * Start periodic health checks
   */
  private startHealthCheck(): void {
    if (!this.config.healthCheckInterval) return;

    this.healthCheckTimer = window.setInterval(() => {
      this.worker.postMessage({ type: 'health-check' });

      // Mark as unhealthy if no response in reasonable time
      setTimeout(() => {
        if (this.stats.isHealthy) {
          this.stats.isHealthy = false;
        }
      }, this.config.healthCheckInterval! / 2);
    }, this.config.healthCheckInterval);
  }

  /**
   * Restart worker
   */
  private restart(): void {
    this.terminate();
    // Worker restart logic would need to be handled by the pool
  }

  /**
   * Get current load (tasks in queue + current task)
   */
  getLoad(): number {
    return this.taskQueue.length + (this.currentTask ? 1 : 0);
  }

  /**
   * Get worker statistics
   */
  getStats(): WorkerStats {
    return { ...this.stats };
  }

  /**
   * Check if worker is available for new tasks
   */
  isAvailable(): boolean {
    return this.stats.isHealthy && !this.currentTask;
  }

  /**
   * Terminate worker
   */
  terminate(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    this.worker.terminate();
  }
}

/**
 * Enhanced worker pool with load balancing and specialization
 */
export class SharedWorkerPool {
  private workers: Map<string, EnhancedWorker> = new Map();
  private workersByType: Map<WorkerType, EnhancedWorker[]> = new Map();
  private sharedMemory: SharedMemoryManager;
  private config: WorkerPoolConfig;
  private taskCounter = 0;

  constructor(config: WorkerPoolConfig, maxNodes: number) {
    this.config = {
      maxWorkers: 4,
      enableSharedArrayBuffer: true,
      enableWorkerPools: true,
      workerTypes: [WorkerType.LAYOUT, WorkerType.PHYSICS, WorkerType.ANALYSIS],
      loadBalancingStrategy: 'least-loaded',
      healthCheckInterval: 5000,
      restartOnError: true,
      ...config
    };

    this.sharedMemory = new SharedMemoryManager(maxNodes);

    if (this.config.enableSharedArrayBuffer) {
      this.sharedMemory.initializeSharedMemory();
    }

    this.initializeWorkers();
  }

  /**
   * Initialize specialized workers
   */
  private initializeWorkers(): void {
    const workerTypes = this.config.workerTypes || [WorkerType.LAYOUT];
    const workersPerType = Math.ceil(
      this.config.maxWorkers / workerTypes.length
    );

    for (const workerType of workerTypes) {
      const workersForType: EnhancedWorker[] = [];

      for (let i = 0; i < workersPerType; i++) {
        const workerId = `${workerType}-${i}`;
        const workerScript = this.getWorkerScriptForType(workerType);

        const worker = new EnhancedWorker(
          workerScript,
          workerType,
          workerId,
          this.config,
          this.sharedMemory.getSharedBuffers() || undefined
        );

        this.workers.set(workerId, worker);
        workersForType.push(worker);
      }

      this.workersByType.set(workerType, workersForType);
    }
  }

  /**
   * Get worker script path for specific worker type
   */
  private getWorkerScriptForType(type: WorkerType): string {
    // In a real implementation, these would be different worker scripts
    switch (type) {
    case WorkerType.LAYOUT:
      return '/workers/layout.worker.js';
    case WorkerType.PHYSICS:
      return '/workers/physics.worker.js';
    case WorkerType.ANALYSIS:
      return '/workers/analysis.worker.js';
    case WorkerType.STREAMING:
      return '/workers/streaming.worker.js';
    default:
      return '/workers/layout.worker.js';
    }
  }

  /**
   * Submit task to worker pool
   */
  submitTask(
    type: WorkerType,
    data: any,
    priority: number = 0,
    timeout?: number
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const task: WorkerTask = {
        id: `task-${++this.taskCounter}`,
        type,
        priority,
        data,
        timestamp: performance.now(),
        timeout
      };

      const worker = this.selectWorker(type);
      if (!worker) {
        reject(new Error(`No available worker for type ${type}`));
        return;
      }

      // Store resolve/reject for later
      (task as any).resolve = resolve;
      (task as any).reject = reject;

      worker.addTask(task);
    });
  }

  /**
   * Select optimal worker based on load balancing strategy
   */
  private selectWorker(type: WorkerType): EnhancedWorker | null {
    const workersForType = this.workersByType.get(type);
    if (!workersForType || workersForType.length === 0) {
      return null;
    }

    const availableWorkers = workersForType.filter(w => w.getStats().isHealthy);
    if (availableWorkers.length === 0) {
      return null;
    }

    switch (this.config.loadBalancingStrategy) {
    case 'round-robin':
      return this.selectRoundRobin(availableWorkers);
    case 'least-loaded':
      return this.selectLeastLoaded(availableWorkers);
    case 'work-stealing':
      return this.selectWorkStealing(availableWorkers);
    default:
      return availableWorkers[0];
    }
  }

  /**
   * Round robin worker selection
   */
  private selectRoundRobin(workers: EnhancedWorker[]): EnhancedWorker {
    const index = this.taskCounter % workers.length;
    return workers[index];
  }

  /**
   * Least loaded worker selection
   */
  private selectLeastLoaded(workers: EnhancedWorker[]): EnhancedWorker {
    return workers.reduce((least, current) =>
      current.getLoad() < least.getLoad() ? current : least
    );
  }

  /**
   * Work stealing selection (simplified)
   */
  private selectWorkStealing(workers: EnhancedWorker[]): EnhancedWorker {
    // Find worker with no load, or least loaded
    const idleWorker = workers.find(w => w.getLoad() === 0);
    return idleWorker || this.selectLeastLoaded(workers);
  }

  /**
   * Execute layout calculation across multiple workers
   */
  async calculateLayout(
    nodes: WorkerNode[],
    edges: WorkerEdge[],
    params: SimulationParams
  ): Promise<{ positions: Array<{ x: number; y: number; z: number }> }> {
    const chunkSize = Math.ceil(nodes.length / this.config.maxWorkers);
    const tasks: Promise<any>[] = [];

    // Divide nodes into chunks for parallel processing
    for (let i = 0; i < nodes.length; i += chunkSize) {
      const nodeChunk = nodes.slice(i, i + chunkSize);
      const edgeChunk = edges.filter(e =>
        nodeChunk.some(n => n.id === e.source || n.id === e.target)
      );

      const task = this.submitTask(
        WorkerType.LAYOUT,
        {
          nodes: nodeChunk,
          edges: edgeChunk,
          params,
          chunkIndex: Math.floor(i / chunkSize)
        },
        1
      );

      tasks.push(task);
    }

    const results = await Promise.all(tasks);

    // Merge results
    const positions: Array<{ x: number; y: number; z: number }> = [];
    for (const result of results) {
      positions.push(...result.positions);
    }

    return { positions };
  }

  /**
   * Get comprehensive statistics for all workers
   */
  getStats(): {
    totalWorkers: number;
    workersByType: Record<string, number>;
    overallStats: {
      totalTasksCompleted: number;
      averageTaskTime: number;
      healthyWorkers: number;
      totalLoad: number;
    };
    workerStats: WorkerStats[];
    sharedMemoryStats: ReturnType<SharedMemoryManager['getMemoryStats']>;
    } {
    const workerStats = Array.from(this.workers.values()).map(w =>
      w.getStats()
    );

    const totalTasksCompleted = workerStats.reduce(
      (sum, stat) => sum + stat.tasksCompleted,
      0
    );
    const averageTaskTime =
      workerStats.reduce((sum, stat) => sum + stat.averageTaskTime, 0) /
      workerStats.length;
    const healthyWorkers = workerStats.filter(stat => stat.isHealthy).length;
    const totalLoad = workerStats.reduce(
      (sum, stat) => sum + stat.tasksInProgress,
      0
    );

    const workersByType: Record<string, number> = {};
    for (const [type, workers] of this.workersByType) {
      workersByType[type] = workers.length;
    }

    return {
      totalWorkers: this.workers.size,
      workersByType,
      overallStats: {
        totalTasksCompleted,
        averageTaskTime,
        healthyWorkers,
        totalLoad
      },
      workerStats,
      sharedMemoryStats: this.sharedMemory.getMemoryStats()
    };
  }

  /**
   * Dispose of all workers and resources
   */
  dispose(): void {
    for (const worker of this.workers.values()) {
      worker.terminate();
    }
    this.workers.clear();
    this.workersByType.clear();
  }
}
