/**
 * SharedArrayBuffer + Atomics implementation for zero-copy position updates
 * Enables real-time position updates between workers and main thread
 */

// Worker type declarations
declare const importScripts: (...urls: string[]) => void;

export interface SharedPositionConfig {
  nodeCount: number;
  enableVelocity?: boolean;
  enableForces?: boolean;
}

export class SharedPositionBuffer {
  private buffer: SharedArrayBuffer;
  private positions: Float32Array;
  private velocities?: Float32Array;
  private forces?: Float32Array;
  private nodeCount: number;
  private floatsPerNode: number;
  
  // Int32 views for atomic operations (Float32 values as Int32 bits)
  private positionsInt32: Int32Array;
  private velocitiesInt32?: Int32Array;
  private forcesInt32?: Int32Array;

  constructor(config: SharedPositionConfig) {
    this.nodeCount = config.nodeCount;
    
    // Calculate floats per node based on configuration
    this.floatsPerNode = 3; // x, y, z positions
    if (config.enableVelocity) this.floatsPerNode += 3; // vx, vy, vz
    if (config.enableForces) this.floatsPerNode += 3; // fx, fy, fz

    // 4 bytes per float
    const bufferSize = this.nodeCount * this.floatsPerNode * 4;
    this.buffer = new SharedArrayBuffer(bufferSize);
    
    this.initializeViews(config);
  }

  private initializeViews(config: SharedPositionConfig) {
    let offset = 0;
    
    // Position data (required)
    this.positions = new Float32Array(this.buffer, offset, this.nodeCount * 3);
    this.positionsInt32 = new Int32Array(this.buffer, offset, this.nodeCount * 3);
    offset += this.nodeCount * 3 * 4;
    
    // Velocity data (optional)
    if (config.enableVelocity) {
      this.velocities = new Float32Array(this.buffer, offset, this.nodeCount * 3);
      this.velocitiesInt32 = new Int32Array(this.buffer, offset, this.nodeCount * 3);
      offset += this.nodeCount * 3 * 4;
    }
    
    // Force data (optional)
    if (config.enableForces) {
      this.forces = new Float32Array(this.buffer, offset, this.nodeCount * 3);
      this.forcesInt32 = new Int32Array(this.buffer, offset, this.nodeCount * 3);
    }
  }

  /**
   * Convert Float32 to Int32 for atomic operations
   */
  private floatToInt32(value: number): number {
    const buffer = new ArrayBuffer(4);
    const floatView = new Float32Array(buffer);
    const intView = new Int32Array(buffer);
    floatView[0] = value;
    return intView[0];
  }

  /**
   * Convert Int32 back to Float32 from atomic operations
   */
  private int32ToFloat(value: number): number {
    const buffer = new ArrayBuffer(4);
    const intView = new Int32Array(buffer);
    const floatView = new Float32Array(buffer);
    intView[0] = value;
    return floatView[0];
  }

  /**
   * Atomically update position for a single node
   */
  updatePosition(nodeIndex: number, x: number, y: number, z: number = 0) {
    if (nodeIndex >= this.nodeCount) return;
    
    const offset = nodeIndex * 3;
    Atomics.store(this.positionsInt32, offset, this.floatToInt32(x));
    Atomics.store(this.positionsInt32, offset + 1, this.floatToInt32(y));
    Atomics.store(this.positionsInt32, offset + 2, this.floatToInt32(z));
  }

  /**
   * Atomically update velocity for a single node
   */
  updateVelocity(nodeIndex: number, vx: number, vy: number, vz: number = 0) {
    if (!this.velocitiesInt32 || nodeIndex >= this.nodeCount) return;
    
    const offset = nodeIndex * 3;
    Atomics.store(this.velocitiesInt32, offset, this.floatToInt32(vx));
    Atomics.store(this.velocitiesInt32, offset + 1, this.floatToInt32(vy));
    Atomics.store(this.velocitiesInt32, offset + 2, this.floatToInt32(vz));
  }

  /**
   * Atomically update forces for a single node
   */
  updateForces(nodeIndex: number, fx: number, fy: number, fz: number = 0) {
    if (!this.forcesInt32 || nodeIndex >= this.nodeCount) return;
    
    const offset = nodeIndex * 3;
    Atomics.store(this.forcesInt32, offset, this.floatToInt32(fx));
    Atomics.store(this.forcesInt32, offset + 1, this.floatToInt32(fy));
    Atomics.store(this.forcesInt32, offset + 2, this.floatToInt32(fz));
  }

  /**
   * Batch update positions for multiple nodes
   * More efficient than individual updates for large batches
   */
  batchUpdatePositions(updates: Array<{ nodeIndex: number; x: number; y: number; z?: number }>) {
    updates.forEach(({ nodeIndex, x, y, z = 0 }) => {
      this.updatePosition(nodeIndex, x, y, z);
    });
  }

  /**
   * Get current position for a node
   */
  getPosition(nodeIndex: number): { x: number; y: number; z: number } | null {
    if (nodeIndex >= this.nodeCount) return null;
    
    const offset = nodeIndex * 3;
    return {
      x: this.int32ToFloat(Atomics.load(this.positionsInt32, offset)),
      y: this.int32ToFloat(Atomics.load(this.positionsInt32, offset + 1)),
      z: this.int32ToFloat(Atomics.load(this.positionsInt32, offset + 2))
    };
  }

  /**
   * Get current velocity for a node
   */
  getVelocity(nodeIndex: number): { vx: number; vy: number; vz: number } | null {
    if (!this.velocities || nodeIndex >= this.nodeCount) return null;
    
    const offset = nodeIndex * 3;
    return {
      vx: this.int32ToFloat(Atomics.load(this.velocitiesInt32!, offset)),
      vy: this.int32ToFloat(Atomics.load(this.velocitiesInt32!, offset + 1)),
      vz: this.int32ToFloat(Atomics.load(this.velocitiesInt32!, offset + 2))
    };
  }

  /**
   * Get current forces for a node
   */
  getForces(nodeIndex: number): { fx: number; fy: number; fz: number } | null {
    if (!this.forces || nodeIndex >= this.nodeCount) return null;
    
    const offset = nodeIndex * 3;
    return {
      fx: this.int32ToFloat(Atomics.load(this.forcesInt32!, offset)),
      fy: this.int32ToFloat(Atomics.load(this.forcesInt32!, offset + 1)),
      fz: this.int32ToFloat(Atomics.load(this.forcesInt32!, offset + 2))
    };
  }

  /**
   * Get direct access to position array (read-only)
   */
  getPositions(): Float32Array {
    return this.positions;
  }

  /**
   * Get direct access to velocity array (read-only)
   */
  getVelocities(): Float32Array | undefined {
    return this.velocities;
  }

  /**
   * Get direct access to forces array (read-only)
   */
  getForcesArray(): Float32Array | undefined {
    return this.forces;
  }

  /**
   * Get the underlying SharedArrayBuffer for transfer to workers
   */
  getSharedBuffer(): SharedArrayBuffer {
    return this.buffer;
  }

  /**
   * Check if SharedArrayBuffer is supported in current environment
   */
  static isSupported(): boolean {
    try {
      return typeof SharedArrayBuffer !== 'undefined' && 
             typeof Atomics !== 'undefined';
    } catch {
      return false;
    }
  }

  /**
   * Create from existing SharedArrayBuffer (for worker initialization)
   */
  static fromSharedBuffer(
    buffer: SharedArrayBuffer, 
    config: SharedPositionConfig
  ): SharedPositionBuffer {
    const instance = Object.create(SharedPositionBuffer.prototype);
    instance.buffer = buffer;
    instance.nodeCount = config.nodeCount;
    instance.floatsPerNode = 3;
    if (config.enableVelocity) instance.floatsPerNode += 3;
    if (config.enableForces) instance.floatsPerNode += 3;
    
    instance.initializeViews(config);
    return instance;
  }
}

/**
 * Synchronization utilities for coordinating between threads
 */
export class SharedMemoryCoordinator {
  private statusBuffer: SharedArrayBuffer;
  private status: Int32Array;
  
  // Status flags
  static readonly STATUS_IDLE = 0;
  static readonly STATUS_COMPUTING = 1;
  static readonly STATUS_READY = 2;
  static readonly STATUS_ERROR = 3;

  constructor() {
    // 4 bytes for status flag
    this.statusBuffer = new SharedArrayBuffer(4);
    this.status = new Int32Array(this.statusBuffer);
    Atomics.store(this.status, 0, SharedMemoryCoordinator.STATUS_IDLE);
  }

  /**
   * Set status atomically
   */
  setStatus(status: number) {
    Atomics.store(this.status, 0, status);
    Atomics.notify(this.status, 0);
  }

  /**
   * Get current status
   */
  getStatus(): number {
    return Atomics.load(this.status, 0);
  }

  /**
   * Wait for specific status with timeout
   */
  async waitForStatus(expectedStatus: number, timeoutMs: number = 5000): Promise<boolean> {
    const startTime = performance.now();
    
    while (performance.now() - startTime < timeoutMs) {
      if (this.getStatus() === expectedStatus) {
        return true;
      }
      
      // Use Atomics.wait in worker context, polling in main thread
      if (typeof importScripts !== 'undefined') {
        // Worker context - can use blocking wait
        const result = Atomics.wait(this.status, 0, this.getStatus(), 100);
        if (result === 'timed-out') continue;
      } else {
        // Main thread - use non-blocking polling
        await new Promise(resolve => setTimeout(resolve, 16));
      }
    }
    
    return false;
  }

  /**
   * Get shared buffer for transfer
   */
  getStatusBuffer(): SharedArrayBuffer {
    return this.statusBuffer;
  }

  /**
   * Create from existing buffer
   */
  static fromSharedBuffer(buffer: SharedArrayBuffer): SharedMemoryCoordinator {
    const instance = Object.create(SharedMemoryCoordinator.prototype);
    instance.statusBuffer = buffer;
    instance.status = new Int32Array(buffer);
    return instance;
  }
}