export { EdgeBatcher } from './EdgeBatcher';
export { EdgeLOD } from './EdgeLOD';
export { EdgeStateManager } from './EdgeStateManager';
export type {
  BatchedEdgeGroups,
  EdgeBatchConfig,
  EdgeRenderState as BatchEdgeRenderState
} from './EdgeBatcher';
export type { LODLevel, EdgeLODConfig } from './EdgeLOD';
export type {
  EdgeRenderState,
  EdgeCategories,
  GraphState,
  EdgeStateConfig
} from './EdgeStateManager';

// Phase 2A: Advanced Memory Management exports
export {
  AdvancedMemoryManager,
  NodeDataBuffer,
  EdgeDataBuffer,
  ViewportCuller
} from './MemoryManager';
export type { MemoryConfig, NodeData, EdgeData } from './MemoryManager';

// Export ObjectPool from utils (used by MemoryManager)
export { ObjectPool } from '../utils/ObjectPool';

// Phase 2B: Instanced Rendering exports
export {
  AdvancedInstancedRenderer,
  NodeInstancedRenderer,
  EdgeInstancedRenderer,
  LODManager,
  TextureAtlasManager
} from './InstancedRenderer';
export type {
  RenderConfig,
  LODLevel as InstancedLODLevel,
  NodeInstanceData,
  EdgeInstanceData
} from './InstancedRenderer';
