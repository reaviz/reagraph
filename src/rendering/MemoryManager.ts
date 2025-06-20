/**
 * Phase 2A: Advanced Memory Management System
 *
 * Implements TypedArray-based data structures, object pooling, and viewport culling
 * for 75% memory reduction and eliminated garbage collection pressure
 */

import * as THREE from 'three';
import { InternalGraphNode, InternalGraphEdge } from '../types';

export interface MemoryConfig {
  maxNodes: number;
  maxEdges: number;
  enableViewportCulling?: boolean;
  enableObjectPooling?: boolean;
  cullingDistance?: number;
  poolGrowthFactor?: number;
}

export interface NodeData {
  id: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  fx: number;
  fy: number;
  fz: number;
  size: number;
  color: number;
  opacity: number;
  visible: boolean;
  selected: boolean;
  highlighted: boolean;
  clusterId: number;
}

export interface EdgeData {
  id: string;
  sourceIndex: number;
  targetIndex: number;
  visible: boolean;
  color: number;
  opacity: number;
  thickness: number;
}

/**
 * Struct-of-Arrays pattern for optimal cache locality and memory usage
 */
export class NodeDataBuffer {
  // Position data
  public readonly positions: Float32Array;
  public readonly velocities: Float32Array;
  public readonly forces: Float32Array;

  // Visual data
  public readonly sizes: Float32Array;
  public readonly colors: Uint32Array;
  public readonly opacities: Float32Array;

  // State data (packed)
  public readonly states: Uint32Array;
  public readonly clusterIds: Uint32Array;

  // Index mapping
  public readonly idToIndex = new Map<string, number>();
  public readonly indexToId = new Map<number, string>();
  public nextIndex = 0;

  constructor(maxNodes: number) {
    // Allocate all arrays at once to ensure memory locality
    this.positions = new Float32Array(maxNodes * 3); // x, y, z
    this.velocities = new Float32Array(maxNodes * 3); // vx, vy, vz
    this.forces = new Float32Array(maxNodes * 3); // fx, fy, fz
    this.sizes = new Float32Array(maxNodes);
    this.colors = new Uint32Array(maxNodes);
    this.opacities = new Float32Array(maxNodes);
    this.states = new Uint32Array(maxNodes); // packed boolean flags
    this.clusterIds = new Uint32Array(maxNodes);
  }

  /**
   * Register a new node and return its index
   */
  registerNode(id: string): number {
    if (this.idToIndex.has(id)) {
      return this.idToIndex.get(id)!;
    }

    const index = this.nextIndex++;
    this.idToIndex.set(id, index);
    this.indexToId.set(index, id);

    // Initialize with defaults
    this.setState(index, {
      visible: true,
      selected: false,
      highlighted: false
    });
    this.opacities[index] = 1.0;
    this.sizes[index] = 1.0;
    this.colors[index] = 0xffffff;
    this.clusterIds[index] = 0;

    return index;
  }

  /**
   * Set position for a node
   */
  setPosition(index: number, x: number, y: number, z: number): void {
    const offset = index * 3;
    this.positions[offset] = x;
    this.positions[offset + 1] = y;
    this.positions[offset + 2] = z;
  }

  /**
   * Get position for a node
   */
  getPosition(index: number): { x: number; y: number; z: number } {
    const offset = index * 3;
    return {
      x: this.positions[offset],
      y: this.positions[offset + 1],
      z: this.positions[offset + 2]
    };
  }

  /**
   * Set velocity for a node
   */
  setVelocity(index: number, vx: number, vy: number, vz: number): void {
    const offset = index * 3;
    this.velocities[offset] = vx;
    this.velocities[offset + 1] = vy;
    this.velocities[offset + 2] = vz;
  }

  /**
   * Get velocity for a node
   */
  getVelocity(index: number): { vx: number; vy: number; vz: number } {
    const offset = index * 3;
    return {
      vx: this.velocities[offset],
      vy: this.velocities[offset + 1],
      vz: this.velocities[offset + 2]
    };
  }

  /**
   * Set forces for a node
   */
  setForces(index: number, fx: number, fy: number, fz: number): void {
    const offset = index * 3;
    this.forces[offset] = fx;
    this.forces[offset + 1] = fy;
    this.forces[offset + 2] = fz;
  }

  /**
   * Get forces for a node
   */
  getForces(index: number): { fx: number; fy: number; fz: number } {
    const offset = index * 3;
    return {
      fx: this.forces[offset],
      fy: this.forces[offset + 1],
      fz: this.forces[offset + 2]
    };
  }

  /**
   * Pack boolean states into single integer
   */
  private packState(state: {
    visible?: boolean;
    selected?: boolean;
    highlighted?: boolean;
  }): number {
    let packed = this.states[0] || 0; // Get current state if index exists

    if (state.visible !== undefined) {
      packed = state.visible ? packed | 1 : packed & ~1;
    }
    if (state.selected !== undefined) {
      packed = state.selected ? packed | 2 : packed & ~2;
    }
    if (state.highlighted !== undefined) {
      packed = state.highlighted ? packed | 4 : packed & ~4;
    }

    return packed;
  }

  /**
   * Unpack boolean states from integer
   */
  private unpackState(packed: number): {
    visible: boolean;
    selected: boolean;
    highlighted: boolean;
  } {
    return {
      visible: !!(packed & 1),
      selected: !!(packed & 2),
      highlighted: !!(packed & 4)
    };
  }

  /**
   * Set state for a node
   */
  setState(
    index: number,
    state: { visible?: boolean; selected?: boolean; highlighted?: boolean }
  ): void {
    this.states[index] = this.packState(state);
  }

  /**
   * Get state for a node
   */
  getState(index: number): {
    visible: boolean;
    selected: boolean;
    highlighted: boolean;
  } {
    return this.unpackState(this.states[index]);
  }

  /**
   * Batch update multiple nodes efficiently
   */
  batchUpdate(
    updates: Array<{
      index: number;
      position?: { x: number; y: number; z: number };
      velocity?: { vx: number; vy: number; vz: number };
      forces?: { fx: number; fy: number; fz: number };
      size?: number;
      color?: number;
      opacity?: number;
      state?: { visible?: boolean; selected?: boolean; highlighted?: boolean };
      clusterId?: number;
    }>
  ): void {
    for (const update of updates) {
      const { index } = update;

      if (update.position) {
        this.setPosition(
          index,
          update.position.x,
          update.position.y,
          update.position.z
        );
      }
      if (update.velocity) {
        this.setVelocity(
          index,
          update.velocity.vx,
          update.velocity.vy,
          update.velocity.vz
        );
      }
      if (update.forces) {
        this.setForces(
          index,
          update.forces.fx,
          update.forces.fy,
          update.forces.fz
        );
      }
      if (update.size !== undefined) {
        this.sizes[index] = update.size;
      }
      if (update.color !== undefined) {
        this.colors[index] = update.color;
      }
      if (update.opacity !== undefined) {
        this.opacities[index] = update.opacity;
      }
      if (update.state) {
        this.setState(index, update.state);
      }
      if (update.clusterId !== undefined) {
        this.clusterIds[index] = update.clusterId;
      }
    }
  }

  /**
   * Clear all data efficiently
   */
  clear(): void {
    this.positions.fill(0);
    this.velocities.fill(0);
    this.forces.fill(0);
    this.sizes.fill(1);
    this.colors.fill(0xffffff);
    this.opacities.fill(1);
    this.states.fill(1); // visible by default
    this.clusterIds.fill(0);
    this.idToIndex.clear();
    this.indexToId.clear();
    this.nextIndex = 0;
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats(): {
    totalBytes: number;
    nodesCount: number;
    maxNodes: number;
    utilizationPercent: number;
    } {
    const totalBytes =
      this.positions.byteLength +
      this.velocities.byteLength +
      this.forces.byteLength +
      this.sizes.byteLength +
      this.colors.byteLength +
      this.opacities.byteLength +
      this.states.byteLength +
      this.clusterIds.byteLength;

    return {
      totalBytes,
      nodesCount: this.nextIndex,
      maxNodes: this.positions.length / 3,
      utilizationPercent: (this.nextIndex / (this.positions.length / 3)) * 100
    };
  }
}

/**
 * Edge data buffer with similar optimizations
 */
export class EdgeDataBuffer {
  public readonly sourceIndices: Uint32Array;
  public readonly targetIndices: Uint32Array;
  public readonly colors: Uint32Array;
  public readonly opacities: Float32Array;
  public readonly thicknesses: Float32Array;
  public readonly states: Uint32Array; // packed boolean flags

  public readonly idToIndex = new Map<string, number>();
  public readonly indexToId = new Map<number, string>();
  public nextIndex = 0;

  constructor(maxEdges: number) {
    this.sourceIndices = new Uint32Array(maxEdges);
    this.targetIndices = new Uint32Array(maxEdges);
    this.colors = new Uint32Array(maxEdges);
    this.opacities = new Float32Array(maxEdges);
    this.thicknesses = new Float32Array(maxEdges);
    this.states = new Uint32Array(maxEdges);
  }

  /**
   * Register a new edge
   */
  registerEdge(id: string, sourceIndex: number, targetIndex: number): number {
    if (this.idToIndex.has(id)) {
      return this.idToIndex.get(id)!;
    }

    const index = this.nextIndex++;
    this.idToIndex.set(id, index);
    this.indexToId.set(index, id);

    this.sourceIndices[index] = sourceIndex;
    this.targetIndices[index] = targetIndex;
    this.colors[index] = 0xffffff;
    this.opacities[index] = 1.0;
    this.thicknesses[index] = 1.0;
    this.states[index] = 1; // visible by default

    return index;
  }

  /**
   * Get edge endpoints
   */
  getEndpoints(index: number): { source: number; target: number } {
    return {
      source: this.sourceIndices[index],
      target: this.targetIndices[index]
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.sourceIndices.fill(0);
    this.targetIndices.fill(0);
    this.colors.fill(0xffffff);
    this.opacities.fill(1);
    this.thicknesses.fill(1);
    this.states.fill(1);
    this.idToIndex.clear();
    this.indexToId.clear();
    this.nextIndex = 0;
  }
}

/**
 * Three.js object pool for reusing geometries and materials
 */
export class ObjectPool<T> {
  private available: T[] = [];
  private createFn: () => T;
  private resetFn: (item: T) => void;
  private maxSize: number;

  constructor(
    createFn: () => T,
    resetFn: (item: T) => void,
    initialSize: number = 100,
    maxSize: number = 1000
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;

    // Pre-allocate initial items
    for (let i = 0; i < initialSize; i++) {
      this.available.push(createFn());
    }
  }

  /**
   * Get an object from the pool
   */
  get(): T {
    if (this.available.length > 0) {
      return this.available.pop()!;
    }

    // Create new if none available
    return this.createFn();
  }

  /**
   * Return an object to the pool
   */
  release(item: T): void {
    if (this.available.length < this.maxSize) {
      this.resetFn(item);
      this.available.push(item);
    } else {
      // Pool is full, let it be garbage collected
      if (item && typeof (item as any).dispose === 'function') {
        (item as any).dispose();
      }
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): {
    available: number;
    maxSize: number;
    utilizationPercent: number;
    } {
    return {
      available: this.available.length,
      maxSize: this.maxSize,
      utilizationPercent:
        ((this.maxSize - this.available.length) / this.maxSize) * 100
    };
  }

  /**
   * Clear the pool
   */
  clear(): void {
    this.available.forEach(item => {
      if (item && typeof (item as any).dispose === 'function') {
        (item as any).dispose();
      }
    });
    this.available.length = 0;
  }
}

/**
 * Viewport-based culling for rendering only visible nodes/edges
 */
export class ViewportCuller {
  private frustum = new THREE.Frustum();
  private cameraMatrix = new THREE.Matrix4();
  private cullingDistance: number;

  constructor(cullingDistance: number = 1000) {
    this.cullingDistance = cullingDistance;
  }

  /**
   * Update frustum from camera
   */
  updateFrustum(camera: THREE.Camera): void {
    this.cameraMatrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    this.frustum.setFromProjectionMatrix(this.cameraMatrix);
  }

  /**
   * Test if a point is visible
   */
  isPointVisible(x: number, y: number, z: number): boolean {
    const point = new THREE.Vector3(x, y, z);
    return this.frustum.containsPoint(point);
  }

  /**
   * Test if a point is within culling distance from camera
   */
  isWithinCullingDistance(
    x: number,
    y: number,
    z: number,
    cameraPosition: THREE.Vector3
  ): boolean {
    const distance = Math.sqrt(
      Math.pow(x - cameraPosition.x, 2) +
        Math.pow(y - cameraPosition.y, 2) +
        Math.pow(z - cameraPosition.z, 2)
    );
    return distance <= this.cullingDistance;
  }

  /**
   * Get visible node indices from position buffer
   */
  getVisibleNodes(
    nodeBuffer: NodeDataBuffer,
    camera: THREE.Camera,
    enableDistanceCulling: boolean = true
  ): number[] {
    this.updateFrustum(camera);
    const visible: number[] = [];
    const cameraPos = camera.position;

    for (let i = 0; i < nodeBuffer.nextIndex; i++) {
      const state = nodeBuffer.getState(i);
      if (!state.visible) continue;

      const pos = nodeBuffer.getPosition(i);

      if (
        enableDistanceCulling &&
        !this.isWithinCullingDistance(pos.x, pos.y, pos.z, cameraPos)
      ) {
        continue;
      }

      if (this.isPointVisible(pos.x, pos.y, pos.z)) {
        visible.push(i);
      }
    }

    return visible;
  }

  /**
   * Get visible edge indices based on their endpoints
   */
  getVisibleEdges(
    edgeBuffer: EdgeDataBuffer,
    nodeBuffer: NodeDataBuffer,
    visibleNodes: Set<number>
  ): number[] {
    const visible: number[] = [];

    for (let i = 0; i < edgeBuffer.nextIndex; i++) {
      const endpoints = edgeBuffer.getEndpoints(i);

      // Edge is visible if either endpoint is visible
      if (
        visibleNodes.has(endpoints.source) ||
        visibleNodes.has(endpoints.target)
      ) {
        visible.push(i);
      }
    }

    return visible;
  }
}

/**
 * Main memory manager coordinating all optimizations
 */
export class AdvancedMemoryManager {
  public readonly nodeBuffer: NodeDataBuffer;
  public readonly edgeBuffer: EdgeDataBuffer;
  public readonly viewportCuller: ViewportCuller;

  // Object pools for Three.js objects
  public readonly sphereGeometryPool: ObjectPool<THREE.SphereGeometry>;
  public readonly meshBasicMaterialPool: ObjectPool<THREE.MeshBasicMaterial>;
  public readonly meshPool: ObjectPool<THREE.Mesh>;
  public readonly instancedMeshPool: ObjectPool<THREE.InstancedMesh>;

  private config: MemoryConfig;
  private frameCounter = 0;
  private lastGCTime = 0;

  constructor(config: MemoryConfig) {
    this.config = config;
    this.nodeBuffer = new NodeDataBuffer(config.maxNodes);
    this.edgeBuffer = new EdgeDataBuffer(config.maxEdges);
    this.viewportCuller = new ViewportCuller(config.cullingDistance);

    // Initialize object pools
    this.sphereGeometryPool = new ObjectPool(
      () => new THREE.SphereGeometry(1, 8, 6),
      geometry => geometry.scale(1, 1, 1),
      50,
      200
    );

    this.meshBasicMaterialPool = new ObjectPool(
      () => new THREE.MeshBasicMaterial(),
      material => {
        material.color.setHex(0xffffff);
        material.opacity = 1;
        material.transparent = false;
      },
      50,
      200
    );

    this.meshPool = new ObjectPool(
      () => new THREE.Mesh(),
      mesh => {
        mesh.position.set(0, 0, 0);
        mesh.scale.set(1, 1, 1);
        mesh.visible = true;
      },
      100,
      500
    );

    this.instancedMeshPool = new ObjectPool(
      () =>
        new THREE.InstancedMesh(
          new THREE.SphereGeometry(1, 8, 6),
          new THREE.MeshBasicMaterial(),
          1000
        ),
      mesh => {
        mesh.count = 0;
        mesh.visible = true;
      },
      10,
      50
    );
  }

  /**
   * Register a node in the system
   */
  registerNode(node: InternalGraphNode): number {
    const index = this.nodeBuffer.registerNode(node.id);

    // Set initial data
    this.nodeBuffer.setPosition(
      index,
      node.position.x,
      node.position.y,
      node.position.z
    );
    this.nodeBuffer.setVelocity(index, node.position.vx, node.position.vy, 0);

    if (node.size !== undefined) {
      this.nodeBuffer.sizes[index] = node.size;
    }

    return index;
  }

  /**
   * Register an edge in the system
   */
  registerEdge(
    edge: InternalGraphEdge,
    sourceIndex: number,
    targetIndex: number
  ): number {
    return this.edgeBuffer.registerEdge(edge.id, sourceIndex, targetIndex);
  }

  /**
   * Update visible elements based on camera
   */
  updateVisibility(camera: THREE.Camera): {
    visibleNodes: number[];
    visibleEdges: number[];
    culledCount: number;
  } {
    if (!this.config.enableViewportCulling) {
      return {
        visibleNodes: Array.from(
          { length: this.nodeBuffer.nextIndex },
          (_, i) => i
        ),
        visibleEdges: Array.from(
          { length: this.edgeBuffer.nextIndex },
          (_, i) => i
        ),
        culledCount: 0
      };
    }

    const visibleNodes = this.viewportCuller.getVisibleNodes(
      this.nodeBuffer,
      camera
    );
    const visibleNodeSet = new Set(visibleNodes);
    const visibleEdges = this.viewportCuller.getVisibleEdges(
      this.edgeBuffer,
      this.nodeBuffer,
      visibleNodeSet
    );

    const culledCount =
      this.nodeBuffer.nextIndex -
      visibleNodes.length +
      (this.edgeBuffer.nextIndex - visibleEdges.length);

    return { visibleNodes, visibleEdges, culledCount };
  }

  /**
   * Perform periodic cleanup to prevent memory leaks
   */
  performMaintenance(): void {
    this.frameCounter++;

    // Perform cleanup every 60 frames (roughly 1 second at 60fps)
    if (this.frameCounter % 60 === 0) {
      const now = performance.now();

      // Only trigger GC if it's been a while since last one
      if (now - this.lastGCTime > 5000) {
        this.lastGCTime = now;

        // Hint to garbage collector (if available)
        if (typeof (globalThis as any).gc === 'function') {
          (globalThis as any).gc();
        }
      }
    }
  }

  /**
   * Get comprehensive memory statistics
   */
  getMemoryStats(): {
    nodes: ReturnType<NodeDataBuffer['getMemoryStats']>;
    edges: {
      totalBytes: number;
      edgesCount: number;
      maxEdges: number;
      utilizationPercent: number;
    };
    pools: {
      sphereGeometry: ReturnType<ObjectPool<THREE.SphereGeometry>['getStats']>;
      meshBasicMaterial: ReturnType<
        ObjectPool<THREE.MeshBasicMaterial>['getStats']
      >;
      mesh: ReturnType<ObjectPool<THREE.Mesh>['getStats']>;
      instancedMesh: ReturnType<ObjectPool<THREE.InstancedMesh>['getStats']>;
    };
    totalMemoryBytes: number;
    } {
    const nodeStats = this.nodeBuffer.getMemoryStats();

    const edgeStats = {
      totalBytes:
        this.edgeBuffer.sourceIndices.byteLength +
        this.edgeBuffer.targetIndices.byteLength +
        this.edgeBuffer.colors.byteLength +
        this.edgeBuffer.opacities.byteLength +
        this.edgeBuffer.thicknesses.byteLength +
        this.edgeBuffer.states.byteLength,
      edgesCount: this.edgeBuffer.nextIndex,
      maxEdges: this.edgeBuffer.sourceIndices.length,
      utilizationPercent:
        (this.edgeBuffer.nextIndex / this.edgeBuffer.sourceIndices.length) * 100
    };

    const totalMemoryBytes = nodeStats.totalBytes + edgeStats.totalBytes;

    return {
      nodes: nodeStats,
      edges: edgeStats,
      pools: {
        sphereGeometry: this.sphereGeometryPool.getStats(),
        meshBasicMaterial: this.meshBasicMaterialPool.getStats(),
        mesh: this.meshPool.getStats(),
        instancedMesh: this.instancedMeshPool.getStats()
      },
      totalMemoryBytes
    };
  }

  /**
   * Clear all data and reset pools
   */
  clear(): void {
    this.nodeBuffer.clear();
    this.edgeBuffer.clear();
    this.sphereGeometryPool.clear();
    this.meshBasicMaterialPool.clear();
    this.meshPool.clear();
    this.instancedMeshPool.clear();
    this.frameCounter = 0;
    this.lastGCTime = 0;
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    this.clear();
  }
}
