/**
 * SharedArrayBuffer edge updates for real-time edge position updates
 * Enables zero-copy communication between workers and main thread for edge data
 */

// Worker type declarations
declare const importScripts: (...urls: string[]) => void;

export interface EdgePositionData {
  startX: number;
  startY: number;
  startZ: number;
  endX: number;
  endY: number;
  endZ: number;
}

export interface EdgeStateData {
  visible: boolean;
  highlighted: boolean;
  selected: boolean;
  animated: boolean;
  color: number;
  opacity: number;
  thickness: number;
}

export interface EdgePositionUpdate {
  edgeIndex: number;
  start: { x: number; y: number; z: number };
  end: { x: number; y: number; z: number };
}

export interface EdgeStateUpdate {
  edgeIndex: number;
  state: EdgeStateData;
}

export interface SharedEdgeConfig {
  edgeCount: number;
  enablePositionSharing?: boolean;
  enableStateSharing?: boolean;
  enableMetrics?: boolean;
}

/**
 * Shared buffer for edge position data
 */
export class SharedEdgeBuffer {
  private buffer: SharedArrayBuffer;
  private positions: Float32Array;
  private states: Uint32Array;
  private metrics: Uint32Array;

  // Int32 views for atomic operations (Float32 values as Int32 bits)
  private positionsInt32: Int32Array;
  private edgeCount: number;
  private config: SharedEdgeConfig;

  // Buffer layout offsets
  private static readonly POSITION_FLOATS_PER_EDGE = 6; // startX, startY, startZ, endX, endY, endZ
  private static readonly STATE_INTS_PER_EDGE = 2; // packed state data
  private static readonly METRICS_SIZE = 16; // various metrics

  constructor(config: SharedEdgeConfig) {
    this.config = config;
    this.edgeCount = config.edgeCount;

    // Calculate buffer size
    const positionBytes = config.enablePositionSharing
      ? this.edgeCount * SharedEdgeBuffer.POSITION_FLOATS_PER_EDGE * 4
      : 0;
    const stateBytes = config.enableStateSharing
      ? this.edgeCount * SharedEdgeBuffer.STATE_INTS_PER_EDGE * 4
      : 0;
    const metricsBytes = config.enableMetrics
      ? SharedEdgeBuffer.METRICS_SIZE * 4
      : 0;

    const totalBytes = positionBytes + stateBytes + metricsBytes;
    this.buffer = new SharedArrayBuffer(totalBytes);

    this.initializeViews(positionBytes, stateBytes, metricsBytes);
  }

  /**
   * Initialize typed array views on the shared buffer
   */
  private initializeViews(
    positionBytes: number,
    stateBytes: number,
    metricsBytes: number
  ): void {
    let offset = 0;

    // Position data
    if (this.config.enablePositionSharing) {
      this.positions = new Float32Array(
        this.buffer,
        offset,
        this.edgeCount * SharedEdgeBuffer.POSITION_FLOATS_PER_EDGE
      );
      this.positionsInt32 = new Int32Array(
        this.buffer,
        offset,
        this.edgeCount * SharedEdgeBuffer.POSITION_FLOATS_PER_EDGE
      );
      offset += positionBytes;
    }

    // State data
    if (this.config.enableStateSharing) {
      this.states = new Uint32Array(
        this.buffer,
        offset,
        this.edgeCount * SharedEdgeBuffer.STATE_INTS_PER_EDGE
      );
      offset += stateBytes;
    }

    // Metrics data
    if (this.config.enableMetrics) {
      this.metrics = new Uint32Array(
        this.buffer,
        offset,
        SharedEdgeBuffer.METRICS_SIZE
      );
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
   * Atomically update edge position
   */
  updateEdgePosition(
    edgeIndex: number,
    start: { x: number; y: number; z: number },
    end: { x: number; y: number; z: number }
  ): void {
    if (!this.positions || edgeIndex >= this.edgeCount) return;

    const offset = edgeIndex * SharedEdgeBuffer.POSITION_FLOATS_PER_EDGE;

    Atomics.store(this.positionsInt32, offset, this.floatToInt32(start.x));
    Atomics.store(this.positionsInt32, offset + 1, this.floatToInt32(start.y));
    Atomics.store(this.positionsInt32, offset + 2, this.floatToInt32(start.z));
    Atomics.store(this.positionsInt32, offset + 3, this.floatToInt32(end.x));
    Atomics.store(this.positionsInt32, offset + 4, this.floatToInt32(end.y));
    Atomics.store(this.positionsInt32, offset + 5, this.floatToInt32(end.z));
  }

  /**
   * Get edge position data
   */
  getEdgePosition(edgeIndex: number): EdgePositionData | null {
    if (!this.positions || edgeIndex >= this.edgeCount) return null;

    const offset = edgeIndex * SharedEdgeBuffer.POSITION_FLOATS_PER_EDGE;

    return {
      startX: this.int32ToFloat(Atomics.load(this.positionsInt32, offset)),
      startY: this.int32ToFloat(Atomics.load(this.positionsInt32, offset + 1)),
      startZ: this.int32ToFloat(Atomics.load(this.positionsInt32, offset + 2)),
      endX: this.int32ToFloat(Atomics.load(this.positionsInt32, offset + 3)),
      endY: this.int32ToFloat(Atomics.load(this.positionsInt32, offset + 4)),
      endZ: this.int32ToFloat(Atomics.load(this.positionsInt32, offset + 5))
    };
  }

  /**
   * Batch update multiple edge positions
   */
  batchUpdatePositions(updates: EdgePositionUpdate[]): void {
    if (!this.positions) return;

    updates.forEach(({ edgeIndex, start, end }) => {
      this.updateEdgePosition(edgeIndex, start, end);
    });

    // Update metrics
    if (this.metrics) {
      const currentUpdates = Atomics.load(this.metrics, 0);
      Atomics.store(this.metrics, 0, currentUpdates + updates.length);
    }
  }

  /**
   * Pack edge state data into integers for atomic operations
   */
  private packEdgeState(state: EdgeStateData): [number, number] {
    // Pack boolean flags into first integer
    let flags = 0;
    if (state.visible) flags |= 1;
    if (state.highlighted) flags |= 2;
    if (state.selected) flags |= 4;
    if (state.animated) flags |= 8;

    // Pack color and opacity into first integer (remaining bits)
    const colorR = (state.color >> 16) & 0xff;
    const colorG = (state.color >> 8) & 0xff;
    const colorB = state.color & 0xff;
    const opacity = Math.floor(state.opacity * 255);

    const packed1 = flags | (colorR << 8) | (colorG << 16) | (colorB << 24);

    // Pack thickness and opacity into second integer
    const thickness = Math.floor(state.thickness * 1000); // Store as fixed point
    const packed2 = opacity | (thickness << 8);

    return [packed1, packed2];
  }

  /**
   * Unpack edge state data from integers
   */
  private unpackEdgeState(packed1: number, packed2: number): EdgeStateData {
    const flags = packed1 & 0xff;
    const colorR = (packed1 >> 8) & 0xff;
    const colorG = (packed1 >> 16) & 0xff;
    const colorB = (packed1 >> 24) & 0xff;

    const opacity = packed2 & 0xff;
    const thickness = (packed2 >> 8) / 1000; // Convert back from fixed point

    return {
      visible: !!(flags & 1),
      highlighted: !!(flags & 2),
      selected: !!(flags & 4),
      animated: !!(flags & 8),
      color: (colorR << 16) | (colorG << 8) | colorB,
      opacity: opacity / 255,
      thickness
    };
  }

  /**
   * Atomically update edge state
   */
  updateEdgeState(edgeIndex: number, state: EdgeStateData): void {
    if (!this.states || edgeIndex >= this.edgeCount) return;

    const [packed1, packed2] = this.packEdgeState(state);
    const offset = edgeIndex * SharedEdgeBuffer.STATE_INTS_PER_EDGE;

    Atomics.store(this.states, offset, packed1);
    Atomics.store(this.states, offset + 1, packed2);
  }

  /**
   * Get edge state data
   */
  getEdgeState(edgeIndex: number): EdgeStateData | null {
    if (!this.states || edgeIndex >= this.edgeCount) return null;

    const offset = edgeIndex * SharedEdgeBuffer.STATE_INTS_PER_EDGE;
    const packed1 = Atomics.load(this.states, offset);
    const packed2 = Atomics.load(this.states, offset + 1);

    return this.unpackEdgeState(packed1, packed2);
  }

  /**
   * Batch update multiple edge states
   */
  batchUpdateStates(updates: EdgeStateUpdate[]): void {
    if (!this.states) return;

    updates.forEach(({ edgeIndex, state }) => {
      this.updateEdgeState(edgeIndex, state);
    });

    // Update metrics
    if (this.metrics) {
      const currentStateUpdates = Atomics.load(this.metrics, 1);
      Atomics.store(this.metrics, 1, currentStateUpdates + updates.length);
    }
  }

  /**
   * Get all edge positions as a typed array
   */
  getAllPositions(): Float32Array | null {
    return this.positions || null;
  }

  /**
   * Get all edge states as typed arrays
   */
  getAllStates(): Uint32Array | null {
    return this.states || null;
  }

  /**
   * Copy position data to a regular array (for rendering)
   */
  copyPositionsToArray(targetArray: Float32Array, offset: number = 0): void {
    if (!this.positions) return;

    const length = Math.min(this.positions.length, targetArray.length - offset);

    for (let i = 0; i < length; i++) {
      targetArray[offset + i] = this.int32ToFloat(
        Atomics.load(this.positionsInt32, i)
      );
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics(): {
    positionUpdates: number;
    stateUpdates: number;
    lastUpdateTime: number;
    totalOperations: number;
  } | null {
    if (!this.metrics) return null;

    return {
      positionUpdates: Atomics.load(this.metrics, 0),
      stateUpdates: Atomics.load(this.metrics, 1),
      lastUpdateTime: Atomics.load(this.metrics, 2),
      totalOperations: Atomics.load(this.metrics, 3)
    };
  }

  /**
   * Update timestamp
   */
  updateTimestamp(): void {
    if (this.metrics) {
      Atomics.store(this.metrics, 2, Date.now());
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    if (this.positions) {
      for (let i = 0; i < this.positions.length; i++) {
        Atomics.store(this.positionsInt32, i, this.floatToInt32(0));
      }
    }

    if (this.states) {
      for (let i = 0; i < this.states.length; i++) {
        Atomics.store(this.states, i, 0);
      }
    }

    if (this.metrics) {
      for (let i = 0; i < this.metrics.length; i++) {
        Atomics.store(this.metrics, i, 0);
      }
    }
  }

  /**
   * Get the underlying SharedArrayBuffer
   */
  getSharedBuffer(): SharedArrayBuffer {
    return this.buffer;
  }

  /**
   * Get buffer size in bytes
   */
  getBufferSize(): number {
    return this.buffer.byteLength;
  }

  /**
   * Check if SharedArrayBuffer is supported
   */
  static isSupported(): boolean {
    try {
      return (
        typeof SharedArrayBuffer !== 'undefined' &&
        typeof Atomics !== 'undefined'
      );
    } catch {
      return false;
    }
  }

  /**
   * Create from existing SharedArrayBuffer
   */
  static fromSharedBuffer(
    buffer: SharedArrayBuffer,
    config: SharedEdgeConfig
  ): SharedEdgeBuffer {
    const instance = Object.create(SharedEdgeBuffer.prototype);
    instance.buffer = buffer;
    instance.config = config;
    instance.edgeCount = config.edgeCount;

    // Calculate offsets
    const positionBytes = config.enablePositionSharing
      ? config.edgeCount * SharedEdgeBuffer.POSITION_FLOATS_PER_EDGE * 4
      : 0;
    const stateBytes = config.enableStateSharing
      ? config.edgeCount * SharedEdgeBuffer.STATE_INTS_PER_EDGE * 4
      : 0;
    const metricsBytes = config.enableMetrics
      ? SharedEdgeBuffer.METRICS_SIZE * 4
      : 0;

    instance.initializeViews(positionBytes, stateBytes, metricsBytes);
    return instance;
  }
}

/**
 * High-level edge data manager using shared memory
 */
export class SharedEdgeManager {
  private edgeBuffer: SharedEdgeBuffer;
  private edgeIdToIndex = new Map<string, number>();
  private indexToEdgeId = new Map<number, string>();
  private nextIndex = 0;

  constructor(config: SharedEdgeConfig) {
    this.edgeBuffer = new SharedEdgeBuffer(config);
  }

  /**
   * Register an edge and assign it an index
   */
  registerEdge(edgeId: string): number {
    if (this.edgeIdToIndex.has(edgeId)) {
      return this.edgeIdToIndex.get(edgeId)!;
    }

    const index = this.nextIndex++;
    this.edgeIdToIndex.set(edgeId, index);
    this.indexToEdgeId.set(index, edgeId);

    return index;
  }

  /**
   * Update edge position by ID
   */
  updateEdgePositionById(
    edgeId: string,
    start: { x: number; y: number; z: number },
    end: { x: number; y: number; z: number }
  ): void {
    const index = this.edgeIdToIndex.get(edgeId);
    if (index !== undefined) {
      this.edgeBuffer.updateEdgePosition(index, start, end);
    }
  }

  /**
   * Update edge state by ID
   */
  updateEdgeStateById(edgeId: string, state: EdgeStateData): void {
    const index = this.edgeIdToIndex.get(edgeId);
    if (index !== undefined) {
      this.edgeBuffer.updateEdgeState(index, state);
    }
  }

  /**
   * Get edge position by ID
   */
  getEdgePositionById(edgeId: string): EdgePositionData | null {
    const index = this.edgeIdToIndex.get(edgeId);
    if (index !== undefined) {
      return this.edgeBuffer.getEdgePosition(index);
    }
    return null;
  }

  /**
   * Get edge state by ID
   */
  getEdgeStateById(edgeId: string): EdgeStateData | null {
    const index = this.edgeIdToIndex.get(edgeId);
    if (index !== undefined) {
      return this.edgeBuffer.getEdgeState(index);
    }
    return null;
  }

  /**
   * Batch update edges by ID
   */
  batchUpdateByIds(
    updates: Array<{
      edgeId: string;
      position?: {
        start: { x: number; y: number; z: number };
        end: { x: number; y: number; z: number };
      };
      state?: EdgeStateData;
    }>
  ): void {
    const positionUpdates: EdgePositionUpdate[] = [];
    const stateUpdates: EdgeStateUpdate[] = [];

    updates.forEach(({ edgeId, position, state }) => {
      const index = this.edgeIdToIndex.get(edgeId);
      if (index === undefined) return;

      if (position) {
        positionUpdates.push({
          edgeIndex: index,
          start: position.start,
          end: position.end
        });
      }

      if (state) {
        stateUpdates.push({
          edgeIndex: index,
          state
        });
      }
    });

    if (positionUpdates.length > 0) {
      this.edgeBuffer.batchUpdatePositions(positionUpdates);
    }

    if (stateUpdates.length > 0) {
      this.edgeBuffer.batchUpdateStates(stateUpdates);
    }

    this.edgeBuffer.updateTimestamp();
  }

  /**
   * Get the underlying edge buffer
   */
  getEdgeBuffer(): SharedEdgeBuffer {
    return this.edgeBuffer;
  }

  /**
   * Get edge ID mapping statistics
   */
  getMappingStats(): {
    registeredEdges: number;
    maxIndex: number;
    memoryUsage: number;
    } {
    return {
      registeredEdges: this.edgeIdToIndex.size,
      maxIndex: this.nextIndex - 1,
      memoryUsage: this.edgeBuffer.getBufferSize()
    };
  }

  /**
   * Clear all edge registrations
   */
  clearMappings(): void {
    this.edgeIdToIndex.clear();
    this.indexToEdgeId.clear();
    this.nextIndex = 0;
    this.edgeBuffer.clear();
  }
}
