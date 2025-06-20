export { LayoutManager } from './LayoutManager';
export { createWorker, detectBundlerEnvironment } from './worker-loader';
export type { WorkerLoaderOptions, WorkerLoadResult } from './worker-loader';
export type {
  WorkerNode,
  WorkerEdge,
  SimulationParams,
  PositionUpdate,
  LayoutManagerStatus
} from './LayoutManager';

// Phase 2C: GPU Compute Pipeline exports
export {
  WebGLComputePipeline,
  GPUForceCalculator,
  CPUForceCalculator,
  WebGLCapabilities,
  ForceShaders
} from './gpu/WebGLComputePipeline';
export type { ComputeConfig, ForceParams } from './gpu/WebGLComputePipeline';

// Phase 2D: Enhanced Worker Architecture exports
export {
  SharedWorkerPool,
  SharedMemoryManager,
  EnhancedWorker,
  WorkerType
} from './SharedWorkerPool';
export type {
  WorkerPoolConfig,
  WorkerTask,
  WorkerStats,
  SharedMemoryBuffers
} from './SharedWorkerPool';
