/**
 * Barnes-Hut algorithm implementation with memory pooling
 * Uses object pools to reduce garbage collection pressure
 */

import { OctreeNode as PooledOctreeNode, getGlobalOctreePool } from '../../layout/forces/OctreeNodePool';

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
 * Barnes-Hut force calculation with octree pooling
 */
export class PooledBarnesHutForce {
  private theta: number;
  private octreePool = getGlobalOctreePool();
  private rootNode: PooledOctreeNode | null = null;
  private distanceMin = 1;
  private distanceMax = Infinity;

  constructor(theta = 0.5) {
    this.theta = theta;
  }

  /**
   * Build octree from nodes
   */
  buildOctree(nodes: Node3D[]): void {
    if (nodes.length === 0) return;

    // Release previous octree if exists
    if (this.rootNode) {
      this.octreePool.releaseTree(this.rootNode);
      this.rootNode = null;
    }

    // Calculate bounds
    const bounds = this.calculateBounds(nodes);
    
    // Create root node from pool
    this.rootNode = this.octreePool.acquire();
    this.initializeNode(this.rootNode, bounds);

    // Insert all nodes
    for (const node of nodes) {
      this.insertNode(this.rootNode, node);
    }

    // Update centers of mass
    this.updateCentersOfMass(this.rootNode);
  }

  /**
   * Calculate forces for all nodes
   */
  calculateForces(nodes: Node3D[]): ForceResult[] {
    if (!this.rootNode) {
      return nodes.map(() => ({ fx: 0, fy: 0, fz: 0 }));
    }

    const forces: ForceResult[] = [];

    for (const node of nodes) {
      const force = this.calculateNodeForce(node, this.rootNode);
      forces.push(force);
    }

    return forces;
  }

  /**
   * Set theta parameter
   */
  setTheta(theta: number): void {
    this.theta = theta;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.rootNode) {
      this.octreePool.releaseTree(this.rootNode);
      this.rootNode = null;
    }
  }

  private initializeNode(node: PooledOctreeNode, bounds: Bounds3D): void {
    node.x = bounds.minX;
    node.y = bounds.minY;
    node.z = bounds.minZ;
    node.size = Math.max(
      bounds.maxX - bounds.minX,
      bounds.maxY - bounds.minY,
      bounds.maxZ - bounds.minZ
    );
    node.mass = 0;
    node.centerX = 0;
    node.centerY = 0;
    node.centerZ = 0;
    node.body = undefined;
    node.children = undefined;
    node.next = undefined;
  }

  private calculateBounds(nodes: Node3D[]): Bounds3D {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    for (const node of nodes) {
      minX = Math.min(minX, node.x);
      maxX = Math.max(maxX, node.x);
      minY = Math.min(minY, node.y);
      maxY = Math.max(maxY, node.y);
      minZ = Math.min(minZ, node.z);
      maxZ = Math.max(maxZ, node.z);
    }

    // Add padding to prevent nodes on boundaries
    const padding = 1;
    return {
      minX: minX - padding,
      maxX: maxX + padding,
      minY: minY - padding,
      maxY: maxY + padding,
      minZ: minZ - padding,
      maxZ: maxZ + padding
    };
  }

  private insertNode(octree: PooledOctreeNode, node: Node3D): void {
    // If this octree node doesn't contain the point, skip
    if (!this.contains(octree, node.x, node.y, node.z)) {
      return;
    }

    // If this is a leaf with no body, insert here
    if (!octree.body && !octree.children) {
      octree.body = node;
      return;
    }

    // If this has a body but no children, subdivide
    if (octree.body && !octree.children) {
      const existingBody = octree.body;
      octree.body = undefined;
      this.subdivide(octree);
      
      // Re-insert existing body
      if (existingBody) {
        this.insertNode(octree, existingBody as Node3D);
      }
    }

    // Insert into appropriate child
    if (octree.children) {
      const childIndex = this.getChildIndex(octree, node.x, node.y, node.z);
      if (childIndex >= 0 && childIndex < 8) {
        this.insertNode(octree.children[childIndex], node);
      }
    }
  }

  private contains(octree: PooledOctreeNode, x: number, y: number, z: number): boolean {
    const halfSize = octree.size / 2;
    return (
      x >= octree.x && x <= octree.x + octree.size &&
      y >= octree.y && y <= octree.y + octree.size &&
      z >= octree.z && z <= octree.z + octree.size
    );
  }

  private getChildIndex(octree: PooledOctreeNode, x: number, y: number, z: number): number {
    const midX = octree.x + octree.size / 2;
    const midY = octree.y + octree.size / 2;
    const midZ = octree.z + octree.size / 2;

    let index = 0;
    if (x >= midX) index += 1;
    if (y >= midY) index += 2;
    if (z >= midZ) index += 4;
    
    return index;
  }

  private subdivide(octree: PooledOctreeNode): void {
    const halfSize = octree.size / 2;
    octree.children = this.octreePool.acquireChildArray();

    for (let i = 0; i < 8; i++) {
      const child = this.octreePool.acquire();
      const xOffset = (i & 1) ? halfSize : 0;
      const yOffset = (i & 2) ? halfSize : 0;
      const zOffset = (i & 4) ? halfSize : 0;

      this.initializeNode(child, {
        minX: octree.x + xOffset,
        maxX: octree.x + xOffset + halfSize,
        minY: octree.y + yOffset,
        maxY: octree.y + yOffset + halfSize,
        minZ: octree.z + zOffset,
        maxZ: octree.z + zOffset + halfSize
      });

      octree.children[i] = child;
    }
  }

  private updateCentersOfMass(octree: PooledOctreeNode): void {
    if (!octree) return;

    if (octree.body) {
      // Leaf node with body
      const body = octree.body as Node3D;
      octree.mass = body.mass || 1;
      octree.centerX = body.x;
      octree.centerY = body.y;
      octree.centerZ = body.z;
    } else if (octree.children) {
      // Internal node - aggregate children
      let totalMass = 0;
      let centerX = 0;
      let centerY = 0;
      let centerZ = 0;

      for (const child of octree.children) {
        if (child) {
          this.updateCentersOfMass(child);
          
          if (child.mass > 0) {
            totalMass += child.mass;
            centerX += child.centerX * child.mass;
            centerY += child.centerY * child.mass;
            centerZ += child.centerZ * child.mass;
          }
        }
      }

      if (totalMass > 0) {
        octree.mass = totalMass;
        octree.centerX = centerX / totalMass;
        octree.centerY = centerY / totalMass;
        octree.centerZ = centerZ / totalMass;
      }
    }
  }

  private calculateNodeForce(node: Node3D, octree: PooledOctreeNode): ForceResult {
    const force = { fx: 0, fy: 0, fz: 0 };
    
    if (!octree || octree.mass === 0) return force;

    // Don't calculate force with itself
    if (octree.body && (octree.body as Node3D).id === node.id) {
      return force;
    }

    const dx = octree.centerX - node.x;
    const dy = octree.centerY - node.y;
    const dz = octree.centerZ - node.z;
    const distance2 = dx * dx + dy * dy + dz * dz;

    // Apply distance constraints
    const distance = Math.sqrt(distance2);
    if (distance < this.distanceMin || distance > this.distanceMax) {
      return force;
    }

    // Check if we can use this node as an approximation
    const width = octree.size;
    if (octree.body || (width / distance) < this.theta) {
      // Use this node's center of mass
      const strength = (node.charge || -30) * (octree.mass || 1) / distance2;
      const factor = strength / distance;
      
      force.fx = dx * factor;
      force.fy = dy * factor;
      force.fz = dz * factor;
    } else if (octree.children) {
      // Recurse into children
      for (const child of octree.children) {
        if (child && child.mass > 0) {
          const childForce = this.calculateNodeForce(node, child);
          force.fx += childForce.fx;
          force.fy += childForce.fy;
          force.fz += childForce.fz;
        }
      }
    }

    return force;
  }
}

// Export a factory function that creates pooled Barnes-Hut instances
export function createPooledBarnesHutForce(theta = 0.5): PooledBarnesHutForce {
  return new PooledBarnesHutForce(theta);
}