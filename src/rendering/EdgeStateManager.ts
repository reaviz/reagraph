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
}

export class EdgeStateManager {
  private edgeStateCache = new Map<string, EdgeRenderState>();
  private batchDirtyFlags = new Set<string>();
  private lastGraphState: GraphState | null = null;
  private config: EdgeStateConfig;
  private frameCount = 0;

  constructor(config: EdgeStateConfig = {}) {
    this.config = {
      enableCaching: true,
      enableDirtyTracking: true,
      batchUpdateThreshold: 50,
      maxCacheSize: 10000,
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
   * Dispose of all resources
   */
  dispose(): void {
    this.reset();
  }
}
