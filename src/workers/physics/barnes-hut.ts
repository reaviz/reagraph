/**
 * Barnes-Hut algorithm implementation for O(n log n) spatial optimization
 * Dramatically improves performance for large graphs by approximating distant forces
 */

export interface Node3D {
  id: string;
  x: number;
  y: number;
  z: number;
  vx?: number;
  vy?: number;
  vz?: number;
  mass?: number;
  charge?: number;
}

export interface Bounds3D {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export interface ForceResult {
  fx: number;
  fy: number;
  fz: number;
}

/**
 * 3D Octree node for spatial partitioning
 */
class OctreeNode {
  bounds: Bounds3D;
  centerOfMass: { x: number; y: number; z: number };
  totalMass: number;
  node: Node3D | null;
  children: OctreeNode[] | null;
  nodeCount: number;

  constructor(bounds: Bounds3D) {
    this.bounds = bounds;
    this.centerOfMass = { x: 0, y: 0, z: 0 };
    this.totalMass = 0;
    this.node = null;
    this.children = null;
    this.nodeCount = 0;
  }

  /**
   * Check if this is a leaf node
   */
  isLeaf(): boolean {
    return this.children === null;
  }

  /**
   * Check if point is within bounds
   */
  contains(x: number, y: number, z: number): boolean {
    return (
      x >= this.bounds.minX &&
      x <= this.bounds.maxX &&
      y >= this.bounds.minY &&
      y <= this.bounds.maxY &&
      z >= this.bounds.minZ &&
      z <= this.bounds.maxZ
    );
  }

  /**
   * Get the width of this octree node
   */
  getWidth(): number {
    return Math.max(
      this.bounds.maxX - this.bounds.minX,
      this.bounds.maxY - this.bounds.minY,
      this.bounds.maxZ - this.bounds.minZ
    );
  }

  /**
   * Subdivide this node into 8 children
   */
  subdivide() {
    const { minX, maxX, minY, maxY, minZ, maxZ } = this.bounds;
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    const midZ = (minZ + maxZ) / 2;

    this.children = [
      // Bottom 4 children (z = minZ to midZ)
      new OctreeNode({ minX, maxX: midX, minY, maxY: midY, minZ, maxZ: midZ }),
      new OctreeNode({ minX: midX, maxX, minY, maxY: midY, minZ, maxZ: midZ }),
      new OctreeNode({ minX, maxX: midX, minY: midY, maxY, minZ, maxZ: midZ }),
      new OctreeNode({ minX: midX, maxX, minY: midY, maxY, minZ, maxZ: midZ }),

      // Top 4 children (z = midZ to maxZ)
      new OctreeNode({ minX, maxX: midX, minY, maxY: midY, minZ: midZ, maxZ }),
      new OctreeNode({ minX: midX, maxX, minY, maxY: midY, minZ: midZ, maxZ }),
      new OctreeNode({ minX, maxX: midX, minY: midY, maxY, minZ: midZ, maxZ }),
      new OctreeNode({ minX: midX, maxX, minY: midY, maxY, minZ: midZ, maxZ })
    ];
  }

  /**
   * Insert a node into the octree
   */
  insert(node: Node3D): boolean {
    if (!this.contains(node.x, node.y, node.z)) {
      return false;
    }

    // Update total mass and center of mass
    const nodeMass = node.mass || 1;
    const totalMass = this.totalMass + nodeMass;

    this.centerOfMass.x =
      (this.centerOfMass.x * this.totalMass + node.x * nodeMass) / totalMass;
    this.centerOfMass.y =
      (this.centerOfMass.y * this.totalMass + node.y * nodeMass) / totalMass;
    this.centerOfMass.z =
      (this.centerOfMass.z * this.totalMass + node.z * nodeMass) / totalMass;

    this.totalMass = totalMass;
    this.nodeCount++;

    // If this is an empty leaf, store the node
    if (this.nodeCount === 1 && this.isLeaf()) {
      this.node = node;
      return true;
    }

    // If this is a leaf with a node, subdivide
    if (this.isLeaf() && this.node) {
      this.subdivide();

      // Move existing node to appropriate child
      const existingNode = this.node;
      this.node = null;

      for (const child of this.children!) {
        if (child.insert(existingNode)) {
          break;
        }
      }
    }

    // Insert new node into appropriate child
    for (const child of this.children!) {
      if (child.insert(node)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate force on a node using Barnes-Hut approximation
   */
  calculateForce(node: Node3D, theta: number): ForceResult {
    const force: ForceResult = { fx: 0, fy: 0, fz: 0 };

    if (this.nodeCount === 0) {
      return force;
    }

    const dx = this.centerOfMass.x - node.x;
    const dy = this.centerOfMass.y - node.y;
    const dz = this.centerOfMass.z - node.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // Avoid self-interaction and division by zero
    if (distance < 1e-6) {
      return force;
    }

    const width = this.getWidth();

    // If far enough away, treat as single body (Barnes-Hut approximation)
    if (this.isLeaf() || width / distance < theta) {
      const nodeCharge = node.charge || -250;
      const thisCharge = this.totalMass * (nodeCharge / Math.abs(nodeCharge));

      // Coulomb force with distance falloff
      const strength =
        (nodeCharge * thisCharge) / (distance * distance * distance);

      force.fx = dx * strength;
      force.fy = dy * strength;
      force.fz = dz * strength;
    } else if (this.children) {
      // Too close - calculate forces from children
      for (const child of this.children) {
        const childForce = child.calculateForce(node, theta);
        force.fx += childForce.fx;
        force.fy += childForce.fy;
        force.fz += childForce.fz;
      }
    }

    return force;
  }
}

/**
 * Barnes-Hut force calculator
 */
export class BarnesHutForce {
  private octree: OctreeNode | null = null;
  private theta: number;
  private bounds: Bounds3D | null = null;

  constructor(theta: number = 0.5) {
    this.theta = theta; // Approximation parameter: smaller = more accurate, larger = faster
  }

  /**
   * Set the approximation parameter
   * @param theta - Barnes-Hut approximation parameter (0.1 = accurate, 1.0 = fast)
   */
  setTheta(theta: number) {
    this.theta = theta;
  }

  /**
   * Calculate bounds for all nodes
   */
  private calculateBounds(nodes: Node3D[]): Bounds3D {
    if (nodes.length === 0) {
      return {
        minX: -100,
        maxX: 100,
        minY: -100,
        maxY: 100,
        minZ: -100,
        maxZ: 100
      };
    }

    let minX = nodes[0].x;
    let maxX = nodes[0].x;
    let minY = nodes[0].y;
    let maxY = nodes[0].y;
    let minZ = nodes[0].z || 0;
    let maxZ = nodes[0].z || 0;

    for (const node of nodes) {
      minX = Math.min(minX, node.x);
      maxX = Math.max(maxX, node.x);
      minY = Math.min(minY, node.y);
      maxY = Math.max(maxY, node.y);
      minZ = Math.min(minZ, node.z || 0);
      maxZ = Math.max(maxZ, node.z || 0);
    }

    // Add padding to avoid edge cases
    const padding = Math.max(maxX - minX, maxY - minY, maxZ - minZ) * 0.1;

    return {
      minX: minX - padding,
      maxX: maxX + padding,
      minY: minY - padding,
      maxY: maxY + padding,
      minZ: minZ - padding,
      maxZ: maxZ + padding
    };
  }

  /**
   * Build octree from nodes
   */
  buildOctree(nodes: Node3D[]) {
    this.bounds = this.calculateBounds(nodes);
    this.octree = new OctreeNode(this.bounds);

    for (const node of nodes) {
      this.octree.insert(node);
    }
  }

  /**
   * Calculate forces for all nodes using Barnes-Hut algorithm
   */
  calculateForces(nodes: Node3D[]): ForceResult[] {
    if (!this.octree) {
      this.buildOctree(nodes);
    }

    const forces: ForceResult[] = [];

    for (const node of nodes) {
      const force = this.octree!.calculateForce(node, this.theta);
      forces.push(force);
    }

    return forces;
  }

  /**
   * Calculate force for a single node
   */
  calculateNodeForce(node: Node3D): ForceResult {
    if (!this.octree) {
      throw new Error('Octree not built. Call buildOctree() first.');
    }

    return this.octree.calculateForce(node, this.theta);
  }

  /**
   * Update octree with new node positions
   * More efficient than rebuilding from scratch
   */
  updateOctree(nodes: Node3D[]) {
    // For now, rebuild the octree
    // TODO: Implement incremental updates for better performance
    this.buildOctree(nodes);
  }

  /**
   * Get octree statistics for debugging
   */
  getStatistics(): {
    totalNodes: number;
    maxDepth: number;
    averageNodesPerLeaf: number;
    } {
    if (!this.octree) {
      return { totalNodes: 0, maxDepth: 0, averageNodesPerLeaf: 0 };
    }

    const stats = {
      totalNodes: 0,
      maxDepth: 0,
      leafCount: 0,
      totalLeafNodes: 0
    };

    const traverse = (node: OctreeNode, depth: number) => {
      stats.totalNodes++;
      stats.maxDepth = Math.max(stats.maxDepth, depth);

      if (node.isLeaf()) {
        stats.leafCount++;
        stats.totalLeafNodes += node.nodeCount;
      } else if (node.children) {
        for (const child of node.children) {
          traverse(child, depth + 1);
        }
      }
    };

    traverse(this.octree, 0);

    return {
      totalNodes: stats.totalNodes,
      maxDepth: stats.maxDepth,
      averageNodesPerLeaf:
        stats.leafCount > 0 ? stats.totalLeafNodes / stats.leafCount : 0
    };
  }

  /**
   * Clear the octree
   */
  clear() {
    this.octree = null;
    this.bounds = null;
  }
}

/**
 * Optimized Barnes-Hut implementation for web workers
 */
export class WorkerBarnesHutForce extends BarnesHutForce {
  private nodeCache: Map<string, Node3D> = new Map();
  private forceCache: Map<string, ForceResult> = new Map();
  private cacheValidTicks = 0;
  private readonly maxCacheAge = 5;

  /**
   * Calculate forces with caching for better worker performance
   */
  calculateForcesWithCache(nodes: Node3D[]): ForceResult[] {
    this.cacheValidTicks++;

    // Clear cache periodically to prevent memory growth
    if (this.cacheValidTicks > this.maxCacheAge) {
      this.forceCache.clear();
      this.cacheValidTicks = 0;
    }

    this.buildOctree(nodes);
    const forces: ForceResult[] = [];

    for (const node of nodes) {
      const cacheKey = `${node.id}_${Math.round(node.x)}_${Math.round(node.y)}_${Math.round(node.z || 0)}`;

      let force = this.forceCache.get(cacheKey);
      if (!force) {
        force = this.calculateNodeForce(node);
        this.forceCache.set(cacheKey, force);
      }

      forces.push(force);
    }

    return forces;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.forceCache.size,
      hitRate: 0 // TODO: Implement hit rate tracking
    };
  }
}
