import { ObjectPool } from '../../utils/ObjectPool';

export interface OctreeNode {
  x: number;
  y: number;
  z: number;
  mass: number;
  centerX: number;
  centerY: number;
  centerZ: number;
  size: number;
  children?: OctreeNode[];
  body?: any; // Reference to actual node
  next?: OctreeNode; // For linked list in leaf nodes
}

/**
 * Specialized object pool for Barnes-Hut octree nodes
 * Reduces garbage collection pressure during force calculations
 */
export class OctreeNodePool {
  private pool: ObjectPool<OctreeNode>;
  private childArrayPool: ObjectPool<OctreeNode[]>;

  constructor(initialSize = 1000, maxSize = 50000) {
    // Main node pool
    this.pool = new ObjectPool<OctreeNode>({
      factory: () => this.createNode(),
      reset: node => this.resetNode(node),
      validator: node => this.validateNode(node),
      initialSize,
      maxSize
    });

    // Pool for children arrays (8 children per octree node)
    this.childArrayPool = new ObjectPool<OctreeNode[]>({
      factory: () => new Array(8),
      reset: arr => {
        for (let i = 0; i < 8; i++) {
          arr[i] = undefined as any;
        }
      },
      initialSize: initialSize / 4,
      maxSize: maxSize / 4
    });
  }

  private createNode(): OctreeNode {
    return {
      x: 0,
      y: 0,
      z: 0,
      mass: 0,
      centerX: 0,
      centerY: 0,
      centerZ: 0,
      size: 0,
      children: undefined,
      body: undefined,
      next: undefined
    };
  }

  private resetNode(node: OctreeNode): void {
    node.x = 0;
    node.y = 0;
    node.z = 0;
    node.mass = 0;
    node.centerX = 0;
    node.centerY = 0;
    node.centerZ = 0;
    node.size = 0;

    // Clear children references but don't recursively release them
    // The caller (releaseTree) handles the recursive release properly
    if (node.children) {
      this.childArrayPool.release(node.children);
      node.children = undefined;
    }

    node.body = undefined;
    node.next = undefined;
  }

  private validateNode(node: OctreeNode): boolean {
    // Basic validation to ensure node hasn't been corrupted
    return (
      typeof node.x === 'number' &&
      typeof node.y === 'number' &&
      typeof node.z === 'number' &&
      typeof node.mass === 'number' &&
      !isNaN(node.x) &&
      !isNaN(node.y) &&
      !isNaN(node.z) &&
      !isNaN(node.mass)
    );
  }

  /**
   * Acquire a new octree node from the pool
   */
  acquire(): OctreeNode {
    return this.pool.acquire();
  }

  /**
   * Acquire an array for octree children
   */
  acquireChildArray(): OctreeNode[] {
    return this.childArrayPool.acquire();
  }

  /**
   * Release an octree node back to the pool
   */
  release(node: OctreeNode): void {
    this.pool.release(node);
  }

  /**
   * Release an entire octree structure
   */
  releaseTree(root: OctreeNode): void {
    if (!root) return;

    // Depth-first traversal to release all nodes
    const stack: OctreeNode[] = [root];

    while (stack.length > 0) {
      const node = stack.pop()!;

      if (node.children) {
        for (let i = 0; i < 8; i++) {
          if (node.children[i]) {
            stack.push(node.children[i]);
          }
        }
      }

      // Release linked list nodes
      let current = node.next;
      while (current) {
        const next = current.next;
        this.release(current);
        current = next;
      }

      this.release(node);
    }
  }

  /**
   * Pre-warm the pool based on expected graph size
   */
  prewarmForGraphSize(nodeCount: number): void {
    // Estimate octree nodes needed (roughly 1.5x the number of graph nodes)
    const estimatedOctreeNodes = Math.floor(nodeCount * 1.5);
    const currentSize = this.getStats().nodes.total;

    if (estimatedOctreeNodes > currentSize) {
      this.pool.prewarm(estimatedOctreeNodes - currentSize);

      // Pre-warm child arrays (about 1/4 of octree nodes will have children)
      const estimatedChildArrays = Math.floor(estimatedOctreeNodes / 4);
      const currentChildArrays = this.childArrayPool.getStats().total;

      if (estimatedChildArrays > currentChildArrays) {
        this.childArrayPool.prewarm(estimatedChildArrays - currentChildArrays);
      }
    }
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      nodes: this.pool.getStats(),
      childArrays: this.childArrayPool.getStats()
    };
  }

  /**
   * Clear all pooled objects
   */
  clear(): void {
    this.pool.clear();
    this.childArrayPool.clear();
  }
}

// Singleton instance for global use
let globalPool: OctreeNodePool | null = null;

export function getGlobalOctreePool(): OctreeNodePool {
  if (!globalPool) {
    globalPool = new OctreeNodePool(2000, 100000);
    // Register globally for performance tracking
    (globalThis as any).__REAGRAPH_OCTREE_POOL__ = globalPool;
  }
  return globalPool;
}

export function clearGlobalOctreePool(): void {
  if (globalPool) {
    globalPool.clear();
    globalPool = null;
  }
}
