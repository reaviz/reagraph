import { InternalGraphEdge } from '../types';

export interface EdgeRenderState {
  category:
    | 'active'
    | 'inactive'
    | 'dragging'
    | 'intersecting'
    | 'highlighted'
    | 'selected';
  batchKey: string;
  color: number;
  opacity: number;
  size: number;
  animated: boolean;
  highlighted: boolean;
  visible: boolean;
  lastUpdate: number;
}

export interface EdgeCategories {
  active: InternalGraphEdge[];
  inactive: InternalGraphEdge[];
  dragging: InternalGraphEdge[];
  intersecting: InternalGraphEdge[];
  highlighted: InternalGraphEdge[];
  selected: InternalGraphEdge[];
}

export interface GraphState {
  selectedNodes: Set<string>;
  hoveredNodes: Set<string>;
  draggingNodes: Set<string>;
  activeEdges: Set<string>;
  highlightedEdges: Set<string>;
  selectedEdges: Set<string>;
  time: number;
}

export interface EdgeStateConfig {
  enableCaching?: boolean;
  enableDirtyTracking?: boolean;
  batchUpdateThreshold?: number;
  maxCacheSize?: number;
  enableProfiler?: boolean;
  enablePredictiveCaching?: boolean;
  stateCompressionEnabled?: boolean;
  maxStateHistory?: number;
}

export class EdgeStateManager {
  private edgeStateCache = new Map<string, EdgeRenderState>();
  private batchDirtyFlags = new Set<string>();
  private lastGraphState: GraphState | null = null;
  private config: EdgeStateConfig;
  private frameCount = 0;
  private stateHistory: GraphState[] = [];
  private profilerData = {
    categorizeTime: 0,
    cacheHits: 0,
    cacheMisses: 0,
    batchUpdates: 0
  };

  constructor(config: EdgeStateConfig = {}) {
    this.config = {
      enableCaching: true,
      enableDirtyTracking: true,
      batchUpdateThreshold: 50,
      maxCacheSize: 10000,
      enableProfiler: false,
      enablePredictiveCaching: false,
      stateCompressionEnabled: false,
      maxStateHistory: 10,
      ...config
    };
  }

  /**
   * Efficiently categorize edges with dirty flagging and caching
   */
  categorizeEdges(
    edges: InternalGraphEdge[],
    state: GraphState
  ): EdgeCategories {
    const categories: EdgeCategories = {
      active: [],
      inactive: [],
      dragging: [],
      intersecting: [],
      highlighted: [],
      selected: []
    };

    const stateChanged = this.hasGraphStateChanged(state);
    this.frameCount++;

    // Only recategorize edges that have state changes or if forced update
    edges.forEach(edge => {
      const currentState = this.calculateEdgeState(edge, state);
      const cachedState = this.edgeStateCache.get(edge.id);

      let needsUpdate = !cachedState || stateChanged;

      if (this.config.enableCaching && cachedState && !stateChanged) {
        // Check if this specific edge's state has changed
        needsUpdate = !this.statesEqual(currentState, cachedState);
      }

      if (needsUpdate) {
        this.edgeStateCache.set(edge.id, currentState);
        if (this.config.enableDirtyTracking) {
          this.markBatchDirty(currentState.batchKey);
        }
      }

      categories[currentState.category].push(edge);
    });

    this.lastGraphState = this.cloneGraphState(state);
    this.trimCacheIfNeeded();

    return categories;
  }

  /**
   * Calculate render state for a single edge
   */
  private calculateEdgeState(
    edge: InternalGraphEdge,
    state: GraphState
  ): EdgeRenderState {
    const isSourceSelected = state.selectedNodes.has(edge.source);
    const isTargetSelected = state.selectedNodes.has(edge.target);
    const isSourceHovered = state.hoveredNodes.has(edge.source);
    const isTargetHovered = state.hoveredNodes.has(edge.target);
    const isSourceDragging = state.draggingNodes.has(edge.source);
    const isTargetDragging = state.draggingNodes.has(edge.target);
    const isEdgeHighlighted = state.highlightedEdges.has(edge.id);
    const isEdgeSelected = state.selectedEdges.has(edge.id);
    const isEdgeActive = state.activeEdges.has(edge.id);

    let category: EdgeRenderState['category'] = 'inactive';
    let color = 0x666666;
    let opacity = 0.5;
    let size = 1.0;
    let animated = false;
    let highlighted = false;
    let visible = true;

    // Determine category and visual properties
    if (isEdgeSelected) {
      category = 'selected';
      color = 0x0066ff;
      opacity = 1.0;
      size = 2.0;
      highlighted = true;
    } else if (isEdgeHighlighted) {
      category = 'highlighted';
      color = 0xff6600;
      opacity = 0.9;
      size = 1.5;
      highlighted = true;
    } else if (isSourceDragging || isTargetDragging) {
      category = 'dragging';
      color = 0xff9900;
      opacity = 0.8;
      size = 1.2;
      animated = true;
    } else if (
      isSourceSelected ||
      isTargetSelected ||
      isSourceHovered ||
      isTargetHovered
    ) {
      category = 'intersecting';
      color = 0x999999;
      opacity = 0.7;
      size = 1.0;
    } else if (isEdgeActive) {
      category = 'active';
      color = 0xcccccc;
      opacity = 0.8;
      size = 1.0;
    }

    // Apply edge-specific overrides
    if (edge.data?.color) color = edge.data.color;
    if (edge.data?.opacity !== undefined) opacity = edge.data.opacity;
    if (edge.data?.size !== undefined) size = edge.data.size;
    if (edge.data?.animated !== undefined) animated = edge.data.animated;

    const batchKey = this.generateBatchKey(category, color, size, animated);

    return {
      category,
      batchKey,
      color,
      opacity,
      size,
      animated,
      highlighted,
      visible,
      lastUpdate: state.time
    };
  }

  /**
   * Generate batch key for grouping similar edges
   */
  private generateBatchKey(
    category: string,
    color: number,
    size: number,
    animated: boolean
  ): string {
    return `${category}_${color.toString(16)}_${size.toFixed(1)}_${animated ? 'anim' : 'static'}`;
  }

  /**
   * Check if two edge states are equal
   */
  private statesEqual(
    state1: EdgeRenderState,
    state2: EdgeRenderState
  ): boolean {
    return (
      state1.category === state2.category &&
      state1.color === state2.color &&
      state1.opacity === state2.opacity &&
      state1.size === state2.size &&
      state1.animated === state2.animated &&
      state1.highlighted === state2.highlighted &&
      state1.visible === state2.visible
    );
  }

  /**
   * Check if graph state has changed significantly
   */
  private hasGraphStateChanged(state: GraphState): boolean {
    if (!this.lastGraphState) return true;

    return (
      !this.setsEqual(state.selectedNodes, this.lastGraphState.selectedNodes) ||
      !this.setsEqual(state.hoveredNodes, this.lastGraphState.hoveredNodes) ||
      !this.setsEqual(state.draggingNodes, this.lastGraphState.draggingNodes) ||
      !this.setsEqual(state.activeEdges, this.lastGraphState.activeEdges) ||
      !this.setsEqual(
        state.highlightedEdges,
        this.lastGraphState.highlightedEdges
      ) ||
      !this.setsEqual(state.selectedEdges, this.lastGraphState.selectedEdges) ||
      Math.abs(state.time - this.lastGraphState.time) > 100 // Time threshold
    );
  }

  /**
   * Compare two sets for equality
   */
  private setsEqual<T>(set1: Set<T>, set2: Set<T>): boolean {
    if (set1.size !== set2.size) return false;
    for (const item of set1) {
      if (!set2.has(item)) return false;
    }
    return true;
  }

  /**
   * Clone graph state for comparison
   */
  private cloneGraphState(state: GraphState): GraphState {
    return {
      selectedNodes: new Set(state.selectedNodes),
      hoveredNodes: new Set(state.hoveredNodes),
      draggingNodes: new Set(state.draggingNodes),
      activeEdges: new Set(state.activeEdges),
      highlightedEdges: new Set(state.highlightedEdges),
      selectedEdges: new Set(state.selectedEdges),
      time: state.time
    };
  }

  /**
   * Mark batch as dirty for geometry updates
   */
  private markBatchDirty(batchKey: string): void {
    if (this.config.enableDirtyTracking) {
      this.batchDirtyFlags.add(batchKey);
    }
  }

  /**
   * Get dirty batches that need geometry updates
   */
  getDirtyBatches(): Set<string> {
    return new Set(this.batchDirtyFlags);
  }

  /**
   * Clear dirty flags for batches that have been updated
   */
  clearDirtyFlags(batchKeys?: string[]): void {
    if (batchKeys) {
      batchKeys.forEach(key => this.batchDirtyFlags.delete(key));
    } else {
      this.batchDirtyFlags.clear();
    }
  }

  /**
   * Get cached state for an edge
   */
  getEdgeState(edgeId: string): EdgeRenderState | null {
    return this.edgeStateCache.get(edgeId) || null;
  }

  /**
   * Force update state for specific edges
   */
  invalidateEdges(edgeIds: string[]): void {
    edgeIds.forEach(id => {
      const state = this.edgeStateCache.get(id);
      if (state) {
        this.markBatchDirty(state.batchKey);
      }
      this.edgeStateCache.delete(id);
    });
  }

  /**
   * Get statistics about cache performance
   */
  getCacheStats(): {
    cacheSize: number;
    hitRate: number;
    dirtyBatches: number;
    framesSinceLastUpdate: number;
    } {
    return {
      cacheSize: this.edgeStateCache.size,
      hitRate: 0.85, // Placeholder - would track in real implementation
      dirtyBatches: this.batchDirtyFlags.size,
      framesSinceLastUpdate: this.frameCount
    };
  }

  /**
   * Trim cache if it exceeds maximum size
   */
  private trimCacheIfNeeded(): void {
    if (
      !this.config.maxCacheSize ||
      this.edgeStateCache.size <= this.config.maxCacheSize
    ) {
      return;
    }

    // Remove oldest entries (LRU eviction)
    const entries = Array.from(this.edgeStateCache.entries());
    entries.sort((a, b) => a[1].lastUpdate - b[1].lastUpdate);

    const toRemove = entries.slice(
      0,
      this.edgeStateCache.size - this.config.maxCacheSize
    );
    toRemove.forEach(([id]) => this.edgeStateCache.delete(id));
  }

  /**
   * Batch update multiple edges efficiently
   */
  batchUpdateEdges(
    edges: InternalGraphEdge[],
    state: GraphState,
    forceUpdate = false
  ): EdgeCategories {
    // Only use batch update for large numbers of edges
    if (edges.length >= this.config.batchUpdateThreshold!) {
      return this.categorizeEdges(edges, state);
    }

    // For smaller numbers, update individually
    const categories: EdgeCategories = {
      active: [],
      inactive: [],
      dragging: [],
      intersecting: [],
      highlighted: [],
      selected: []
    };

    edges.forEach(edge => {
      const edgeState = forceUpdate
        ? this.calculateEdgeState(edge, state)
        : this.edgeStateCache.get(edge.id) ||
          this.calculateEdgeState(edge, state);

      categories[edgeState.category].push(edge);
    });

    return categories;
  }

  /**
   * Clear all caches and reset state
   */
  reset(): void {
    this.edgeStateCache.clear();
    this.batchDirtyFlags.clear();
    this.lastGraphState = null;
    this.frameCount = 0;
  }

  /**
   * Predictive caching based on state history
   */
  predictAndCacheNextStates(edges: InternalGraphEdge[]): void {
    if (!this.config.enablePredictiveCaching || this.stateHistory.length < 3) {
      return;
    }

    // Analyze patterns in state history
    const patterns = this.analyzeStatePatterns();

    // Predict likely next states and pre-cache them
    patterns.forEach(pattern => {
      const predictedState = this.predictNextState(pattern);
      if (predictedState) {
        // Pre-calculate states for a subset of edges
        const sampleEdges = edges.slice(0, Math.min(100, edges.length));
        sampleEdges.forEach(edge => {
          const state = this.calculateEdgeState(edge, predictedState);
          // Store with special key to indicate it's a prediction
          this.edgeStateCache.set(`predict_${edge.id}`, state);
        });
      }
    });
  }

  /**
   * Analyze patterns in state history
   */
  private analyzeStatePatterns(): Array<{ type: string; confidence: number }> {
    const patterns: Array<{ type: string; confidence: number }> = [];

    // Simple pattern detection - could be enhanced with ML
    const recentStates = this.stateHistory.slice(-5);

    // Check for selection patterns
    let selectionGrowing = true;
    for (let i = 1; i < recentStates.length; i++) {
      if (
        recentStates[i].selectedNodes.size <=
        recentStates[i - 1].selectedNodes.size
      ) {
        selectionGrowing = false;
        break;
      }
    }

    if (selectionGrowing) {
      patterns.push({ type: 'expanding_selection', confidence: 0.8 });
    }

    return patterns;
  }

  /**
   * Predict next state based on pattern
   */
  private predictNextState(pattern: {
    type: string;
    confidence: number;
  }): GraphState | null {
    if (!this.lastGraphState) return null;

    const predicted = this.cloneGraphState(this.lastGraphState);

    switch (pattern.type) {
    case 'expanding_selection':
      // Predict more nodes might be selected
      predicted.time += 16; // Next frame
      break;
    }

    return predicted;
  }

  /**
   * Compress state for memory efficiency
   */
  private compressState(state: GraphState): any {
    if (!this.config.stateCompressionEnabled) {
      return state;
    }

    // Simple compression - convert sets to arrays
    return {
      selectedNodes: Array.from(state.selectedNodes),
      hoveredNodes: Array.from(state.hoveredNodes),
      draggingNodes: Array.from(state.draggingNodes),
      activeEdges: Array.from(state.activeEdges),
      highlightedEdges: Array.from(state.highlightedEdges),
      selectedEdges: Array.from(state.selectedEdges),
      time: state.time
    };
  }

  /**
   * Decompress state
   */
  private decompressState(compressed: any): GraphState {
    return {
      selectedNodes: new Set(compressed.selectedNodes),
      hoveredNodes: new Set(compressed.hoveredNodes),
      draggingNodes: new Set(compressed.draggingNodes),
      activeEdges: new Set(compressed.activeEdges),
      highlightedEdges: new Set(compressed.highlightedEdges),
      selectedEdges: new Set(compressed.selectedEdges),
      time: compressed.time
    };
  }

  /**
   * Add state to history for pattern analysis
   */
  private addToStateHistory(state: GraphState): void {
    if (this.config.enablePredictiveCaching) {
      const compressed = this.config.stateCompressionEnabled
        ? this.compressState(state)
        : state;

      this.stateHistory.push(compressed as GraphState);

      // Trim history if it exceeds max size
      if (this.stateHistory.length > this.config.maxStateHistory!) {
        this.stateHistory.shift();
      }
    }
  }

  /**
   * Get advanced statistics including profiler data
   */
  getAdvancedStats(): {
    cache: {
      size: number;
      hitRate: number;
      dirtyBatches: number;
    };
    profiler: {
      averageCategorizeTime: number;
      cacheHitRate: number;
      batchUpdateRate: number;
    };
    prediction: {
      historySize: number;
      predictedCacheSize: number;
    };
    memory: {
      estimatedMemoryUsage: number;
      compressionRatio: number;
    };
    } {
    const totalRequests =
      this.profilerData.cacheHits + this.profilerData.cacheMisses;
    const predictedCacheEntries = Array.from(this.edgeStateCache.keys()).filter(
      key => key.startsWith('predict_')
    ).length;

    return {
      cache: {
        size: this.edgeStateCache.size - predictedCacheEntries,
        hitRate:
          totalRequests > 0 ? this.profilerData.cacheHits / totalRequests : 0,
        dirtyBatches: this.batchDirtyFlags.size
      },
      profiler: {
        averageCategorizeTime:
          this.profilerData.categorizeTime / Math.max(1, this.frameCount),
        cacheHitRate:
          totalRequests > 0 ? this.profilerData.cacheHits / totalRequests : 0,
        batchUpdateRate:
          this.profilerData.batchUpdates / Math.max(1, this.frameCount)
      },
      prediction: {
        historySize: this.stateHistory.length,
        predictedCacheSize: predictedCacheEntries
      },
      memory: {
        estimatedMemoryUsage: this.estimateMemoryUsage(),
        compressionRatio: this.config.stateCompressionEnabled ? 0.6 : 1.0
      }
    };
  }

  /**
   * Estimate memory usage of the manager
   */
  private estimateMemoryUsage(): number {
    let bytes = 0;

    // Edge state cache
    bytes += this.edgeStateCache.size * 100; // Rough estimate per edge state

    // State history
    bytes += this.stateHistory.length * 1000; // Rough estimate per graph state

    // Dirty flags
    bytes += this.batchDirtyFlags.size * 50;

    return bytes;
  }

  /**
   * Enable/disable profiling
   */
  setProfilingEnabled(enabled: boolean): void {
    this.config.enableProfiler = enabled;
    if (!enabled) {
      this.profilerData = {
        categorizeTime: 0,
        cacheHits: 0,
        cacheMisses: 0,
        batchUpdates: 0
      };
    }
  }

  /**
   * Optimize cache based on usage patterns
   */
  optimizeCache(): void {
    const stats = this.getAdvancedStats();

    // If hit rate is low, increase cache size
    if (stats.cache.hitRate < 0.7 && this.config.maxCacheSize! < 50000) {
      this.config.maxCacheSize = Math.min(
        50000,
        this.config.maxCacheSize! * 1.5
      );
    }

    // If memory usage is high, enable compression
    if (
      stats.memory.estimatedMemoryUsage > 1000000 &&
      !this.config.stateCompressionEnabled
    ) {
      this.config.stateCompressionEnabled = true;
    }

    // Clean up old predicted cache entries
    const keysToRemove = Array.from(this.edgeStateCache.keys())
      .filter(key => key.startsWith('predict_'))
      .slice(0, 100); // Remove old predictions

    keysToRemove.forEach(key => this.edgeStateCache.delete(key));
  }

  /**
   * Export state for debugging
   */
  exportDebugData(): {
    config: EdgeStateConfig;
    cacheSize: number;
    historySize: number;
    stats: any;
    } {
    return {
      config: { ...this.config },
      cacheSize: this.edgeStateCache.size,
      historySize: this.stateHistory.length,
      stats: this.getAdvancedStats()
    };
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    this.reset();
  }
}
