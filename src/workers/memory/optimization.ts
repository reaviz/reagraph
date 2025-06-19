/**
 * Memory optimization utilities for high-performance graph rendering
 * Includes object pooling, TypedArray optimization, and garbage collection management
 */

export interface PoolableNode {
  id: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  fx: number | null;
  fy: number | null;
  fz: number | null;
  radius: number;
  mass: number;
  charge: number;
  fixed: boolean;
}

export interface PoolableEdge {
  id: string;
  source: string;
  target: string;
  strength: number;
  distance: number;
  weight: number;
}

export interface MemoryStats {
  nodesPooled: number;
  edgesPooled: number;
  nodesActive: number;
  edgesActive: number;
  memoryUsage: number;
  gcPressure: number;
}

/**
 * Generic object pool for memory optimization
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private active: Set<T> = new Set();
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private maxSize: number;

  constructor(
    createFn: () => T,
    resetFn: (obj: T) => void,
    initialSize: number = 100,
    maxSize: number = 10000
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;

    // Pre-allocate initial objects
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  /**
   * Get an object from the pool
   */
  get(): T {
    let obj = this.pool.pop();
    if (!obj) {
      obj = this.createFn();
    }
    this.active.add(obj);
    return obj;
  }

  /**
   * Return an object to the pool
   */
  release(obj: T): void {
    if (this.active.has(obj)) {
      this.active.delete(obj);
      this.resetFn(obj);

      // Only add back to pool if under max size
      if (this.pool.length < this.maxSize) {
        this.pool.push(obj);
      }
    }
  }

  /**
   * Release multiple objects at once
   */
  releaseMany(objects: T[]): void {
    objects.forEach(obj => this.release(obj));
  }

  /**
   * Get pool statistics
   */
  getStats(): { pooled: number; active: number; total: number } {
    return {
      pooled: this.pool.length,
      active: this.active.size,
      total: this.pool.length + this.active.size
    };
  }

  /**
   * Clear the pool and release all memory
   */
  clear(): void {
    this.pool.length = 0;
    this.active.clear();
  }

  /**
   * Warm up the pool with additional objects
   */
  warmUp(count: number): void {
    for (let i = 0; i < count && this.pool.length < this.maxSize; i++) {
      this.pool.push(this.createFn());
    }
  }
}

/**
 * Specialized node pool for graph simulation
 */
export class NodePool extends ObjectPool<PoolableNode> {
  constructor(initialSize: number = 1000, maxSize: number = 50000) {
    super(
      () => ({
        id: '',
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        fx: null,
        fy: null,
        fz: null,
        radius: 5,
        mass: 1,
        charge: -250,
        fixed: false
      }),
      node => {
        node.id = '';
        node.x = node.y = node.z = 0;
        node.vx = node.vy = node.vz = 0;
        node.fx = node.fy = node.fz = null;
        node.radius = 5;
        node.mass = 1;
        node.charge = -250;
        node.fixed = false;
      },
      initialSize,
      maxSize
    );
  }

  /**
   * Create a node with specific properties
   */
  createNode(
    id: string,
    x: number = 0,
    y: number = 0,
    z: number = 0,
    options: Partial<PoolableNode> = {}
  ): PoolableNode {
    const node = this.get();
    node.id = id;
    node.x = x;
    node.y = y;
    node.z = z;

    Object.assign(node, options);
    return node;
  }

  /**
   * Convert external node data to pooled nodes
   */
  fromNodeData(nodeData: any[]): PoolableNode[] {
    return nodeData.map(data =>
      this.createNode(data.id, data.x || 0, data.y || 0, data.z || 0, {
        radius: data.radius || 5,
        mass: data.mass || 1,
        charge: data.charge || -250,
        fixed: data.fixed || false
      })
    );
  }
}

/**
 * Specialized edge pool for graph simulation
 */
export class EdgePool extends ObjectPool<PoolableEdge> {
  constructor(initialSize: number = 2000, maxSize: number = 100000) {
    super(
      () => ({
        id: '',
        source: '',
        target: '',
        strength: 1,
        distance: 30,
        weight: 1
      }),
      edge => {
        edge.id = '';
        edge.source = '';
        edge.target = '';
        edge.strength = 1;
        edge.distance = 30;
        edge.weight = 1;
      },
      initialSize,
      maxSize
    );
  }

  /**
   * Create an edge with specific properties
   */
  createEdge(
    id: string,
    source: string,
    target: string,
    options: Partial<PoolableEdge> = {}
  ): PoolableEdge {
    const edge = this.get();
    edge.id = id;
    edge.source = source;
    edge.target = target;

    Object.assign(edge, options);
    return edge;
  }

  /**
   * Convert external edge data to pooled edges
   */
  fromEdgeData(edgeData: any[]): PoolableEdge[] {
    return edgeData.map(data =>
      this.createEdge(data.id, data.source, data.target, {
        strength: data.strength || 1,
        distance: data.distance || 30,
        weight: data.weight || 1
      })
    );
  }
}

/**
 * TypedArray buffer pool for efficient data transfer
 */
export class TypedArrayPool {
  private float32Pools = new Map<number, Float32Array[]>();
  private int32Pools = new Map<number, Int32Array[]>();
  private uint16Pools = new Map<number, Uint16Array[]>();

  /**
   * Get a Float32Array of specified size
   */
  getFloat32Array(size: number): Float32Array {
    const pool = this.float32Pools.get(size) || [];
    let array = pool.pop();

    if (!array) {
      array = new Float32Array(size);
    } else {
      // Clear the array
      array.fill(0);
    }

    return array;
  }

  /**
   * Return a Float32Array to the pool
   */
  releaseFloat32Array(array: Float32Array): void {
    const size = array.length;
    if (!this.float32Pools.has(size)) {
      this.float32Pools.set(size, []);
    }

    const pool = this.float32Pools.get(size)!;
    if (pool.length < 10) {
      // Limit pool size
      pool.push(array);
    }
  }

  /**
   * Get an Int32Array of specified size
   */
  getInt32Array(size: number): Int32Array {
    const pool = this.int32Pools.get(size) || [];
    let array = pool.pop();

    if (!array) {
      array = new Int32Array(size);
    } else {
      array.fill(0);
    }

    return array;
  }

  /**
   * Return an Int32Array to the pool
   */
  releaseInt32Array(array: Int32Array): void {
    const size = array.length;
    if (!this.int32Pools.has(size)) {
      this.int32Pools.set(size, []);
    }

    const pool = this.int32Pools.get(size)!;
    if (pool.length < 10) {
      pool.push(array);
    }
  }

  /**
   * Get a Uint16Array of specified size
   */
  getUint16Array(size: number): Uint16Array {
    const pool = this.uint16Pools.get(size) || [];
    let array = pool.pop();

    if (!array) {
      array = new Uint16Array(size);
    } else {
      array.fill(0);
    }

    return array;
  }

  /**
   * Return a Uint16Array to the pool
   */
  releaseUint16Array(array: Uint16Array): void {
    const size = array.length;
    if (!this.uint16Pools.has(size)) {
      this.uint16Pools.set(size, []);
    }

    const pool = this.uint16Pools.get(size)!;
    if (pool.length < 10) {
      pool.push(array);
    }
  }

  /**
   * Clear all pools
   */
  clear(): void {
    this.float32Pools.clear();
    this.int32Pools.clear();
    this.uint16Pools.clear();
  }

  /**
   * Get memory usage statistics
   */
  getStats(): {
    float32Arrays: number;
    int32Arrays: number;
    uint16Arrays: number;
    totalBytes: number;
    } {
    let float32Arrays = 0;
    let int32Arrays = 0;
    let uint16Arrays = 0;
    let totalBytes = 0;

    this.float32Pools.forEach((pool, size) => {
      float32Arrays += pool.length;
      totalBytes += pool.length * size * 4;
    });

    this.int32Pools.forEach((pool, size) => {
      int32Arrays += pool.length;
      totalBytes += pool.length * size * 4;
    });

    this.uint16Pools.forEach((pool, size) => {
      uint16Arrays += pool.length;
      totalBytes += pool.length * size * 2;
    });

    return {
      float32Arrays,
      int32Arrays,
      uint16Arrays,
      totalBytes
    };
  }
}

/**
 * Garbage collection pressure monitor and optimizer
 */
export class GCOptimizer {
  private allocatedObjects = 0;
  private freedObjects = 0;
  private lastGCTime = 0;
  private gcThreshold = 10000;
  private forceGCCallback?: () => void;

  constructor(forceGCCallback?: () => void) {
    this.forceGCCallback = forceGCCallback;
  }

  /**
   * Track object allocation
   */
  trackAllocation(count: number = 1): void {
    this.allocatedObjects += count;
    this.checkGCPressure();
  }

  /**
   * Track object deallocation
   */
  trackDeallocation(count: number = 1): void {
    this.freedObjects += count;
  }

  /**
   * Check if GC pressure is high and trigger collection if needed
   */
  private checkGCPressure(): void {
    const netAllocations = this.allocatedObjects - this.freedObjects;

    if (netAllocations > this.gcThreshold) {
      const now = performance.now();

      // Don't trigger GC too frequently
      if (now - this.lastGCTime > 1000) {
        this.triggerGC();
        this.lastGCTime = now;
      }
    }
  }

  /**
   * Trigger garbage collection
   */
  private triggerGC(): void {
    if (this.forceGCCallback) {
      this.forceGCCallback();
    } else if (typeof gc !== 'undefined') {
      // Node.js environment with --expose-gc flag
      // eslint-disable-next-line no-undef
      gc();
    }

    // Reset counters after GC
    this.allocatedObjects = 0;
    this.freedObjects = 0;
  }

  /**
   * Get GC pressure statistics
   */
  getStats(): {
    allocatedObjects: number;
    freedObjects: number;
    netAllocations: number;
    gcPressure: number;
    } {
    const netAllocations = this.allocatedObjects - this.freedObjects;
    return {
      allocatedObjects: this.allocatedObjects,
      freedObjects: this.freedObjects,
      netAllocations,
      gcPressure: netAllocations / this.gcThreshold
    };
  }

  /**
   * Set GC threshold
   */
  setGCThreshold(threshold: number): void {
    this.gcThreshold = threshold;
  }
}

/**
 * Comprehensive memory manager
 */
export class MemoryManager {
  private nodePool: NodePool;
  private edgePool: EdgePool;
  private typedArrayPool: TypedArrayPool;
  private gcOptimizer: GCOptimizer;

  constructor() {
    this.nodePool = new NodePool();
    this.edgePool = new EdgePool();
    this.typedArrayPool = new TypedArrayPool();
    this.gcOptimizer = new GCOptimizer(() => this.performOptimizations());
  }

  /**
   * Get node pool
   */
  getNodePool(): NodePool {
    return this.nodePool;
  }

  /**
   * Get edge pool
   */
  getEdgePool(): EdgePool {
    return this.edgePool;
  }

  /**
   * Get typed array pool
   */
  getTypedArrayPool(): TypedArrayPool {
    return this.typedArrayPool;
  }

  /**
   * Perform memory optimizations
   */
  private performOptimizations(): void {
    // Clear excessive pooled objects
    const nodeStats = this.nodePool.getStats();
    const edgeStats = this.edgePool.getStats();

    // If pools are getting too large, clear some objects
    if (nodeStats.pooled > 5000) {
      this.nodePool.clear();
      this.nodePool.warmUp(1000);
    }

    if (edgeStats.pooled > 10000) {
      this.edgePool.clear();
      this.edgePool.warmUp(2000);
    }

    // Clear typed array pools periodically
    this.typedArrayPool.clear();
  }

  /**
   * Get comprehensive memory statistics
   */
  getMemoryStats(): MemoryStats {
    const nodeStats = this.nodePool.getStats();
    const edgeStats = this.edgePool.getStats();
    const arrayStats = this.typedArrayPool.getStats();
    const gcStats = this.gcOptimizer.getStats();

    return {
      nodesPooled: nodeStats.pooled,
      edgesPooled: edgeStats.pooled,
      nodesActive: nodeStats.active,
      edgesActive: edgeStats.active,
      memoryUsage: arrayStats.totalBytes,
      gcPressure: gcStats.gcPressure
    };
  }

  /**
   * Cleanup all memory resources
   */
  cleanup(): void {
    this.nodePool.clear();
    this.edgePool.clear();
    this.typedArrayPool.clear();
  }

  /**
   * Warm up pools for expected usage
   */
  warmUp(nodeCount: number, edgeCount: number): void {
    this.nodePool.warmUp(Math.min(nodeCount, 10000));
    this.edgePool.warmUp(Math.min(edgeCount, 20000));
  }
}

// Global memory manager instance
export const memoryManager = new MemoryManager();
