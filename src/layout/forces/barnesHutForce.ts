/**
 * D3-compatible Barnes-Hut force implementation
 * Provides O(n log n) force calculations for large graphs
 */

import { BarnesHutForce, Node3D, ForceResult } from '../../workers/physics/barnes-hut';
import { PooledBarnesHutForce, createPooledBarnesHutForce } from '../../workers/physics/barnes-hut-pooled';
import { getGlobalOctreePool } from './OctreeNodePool';

export interface D3Node {
  id?: string;
  x: number;
  y: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  fx?: number;
  fy?: number;
  fz?: number;
  index?: number;
  charge?: number;
}

/**
 * Creates a D3-compatible Barnes-Hut force
 * @param theta - Barnes-Hut approximation parameter (0.1 = accurate, 1.0 = fast)
 * @returns D3-compatible force function
 */
export function forceBarnesHut(theta = 0.5, usePooling = true) {
  let nodes: D3Node[] = [];
  let strengths: number[] = [];
  let strength = -250;
  let distanceMin2 = 1;
  let distanceMax2 = Infinity;
  
  // Use pooled version for better memory efficiency
  const barnesHut = usePooling 
    ? createPooledBarnesHutForce(theta)
    : new BarnesHutForce(theta);
  const octreePool = getGlobalOctreePool();

  function force(alpha: number) {
    if (!nodes || nodes.length === 0) return;
    
    // Pre-warm octree pool if needed
    octreePool.prewarmForGraphSize(nodes.length);

    // Convert D3 nodes to Barnes-Hut format
    const bhNodes: Node3D[] = nodes.map((node, i) => ({
      id: node.id || `node-${i}`,
      x: node.x || 0,
      y: node.y || 0,
      z: node.z || 0,
      vx: node.vx || 0,
      vy: node.vy || 0,
      vz: node.vz || 0,
      charge: node.charge !== undefined ? node.charge : (strengths[i] || strength)
    }));

    // Build octree and calculate forces
    // The Barnes-Hut implementation should use the octree pool internally
    barnesHut.buildOctree(bhNodes);
    const forces = barnesHut.calculateForces(bhNodes);

    // Apply forces back to D3 nodes
    nodes.forEach((node, i) => {
      if (!node.fx && node.fx !== 0) {
        const nodeStrength = strengths[i] || strength;
        const force = forces[i];
        
        // Apply force with strength and alpha decay
        const fx = force.fx * nodeStrength * alpha;
        const fy = force.fy * nodeStrength * alpha;
        const fz = force.fz * nodeStrength * alpha;
        
        // Update velocities
        node.vx = (node.vx || 0) + fx;
        node.vy = (node.vy || 0) + fy;
        if (node.z !== undefined && node.vz !== undefined) {
          node.vz += fz;
        }
      }
    });
  }

  function initialize() {
    if (!nodes) return;
    
    // Initialize strengths array
    const n = nodes.length;
    strengths = new Array(n);
    
    for (let i = 0; i < n; ++i) {
      const node = nodes[i];
      strengths[i] = node.charge !== undefined ? node.charge : strength;
    }
  }

  // D3-compatible force API
  force.initialize = function(_: D3Node[]) {
    nodes = _;
    initialize();
  };

  force.strength = function(_?: number | ((d: D3Node, i: number) => number)) {
    return arguments.length 
      ? (strength = typeof _ === 'function' ? _ : +_, initialize(), force) 
      : strength;
  };

  force.theta = function(_?: number) {
    return arguments.length 
      ? (barnesHut.setTheta(+_), force) 
      : theta;
  };

  force.distanceMin = function(_?: number) {
    return arguments.length 
      ? (distanceMin2 = _ * _, force) 
      : Math.sqrt(distanceMin2);
  };

  force.distanceMax = function(_?: number) {
    return arguments.length 
      ? (distanceMax2 = _ * _, force) 
      : Math.sqrt(distanceMax2);
  };
  
  // Add dispose method for cleanup
  force.dispose = function() {
    if ('dispose' in barnesHut) {
      (barnesHut as PooledBarnesHutForce).dispose();
    }
  };

  return force;
}

/**
 * Adaptive Barnes-Hut force that adjusts theta based on performance
 */
export class AdaptiveBarnesHutForce {
  private theta: number;
  private targetFrameTime: number;
  private force: ReturnType<typeof forceBarnesHut>;
  private lastFrameTime: number = 0;
  private adjustmentRate: number = 0.05;

  constructor(initialTheta = 0.5, targetFPS = 60) {
    this.theta = initialTheta;
    this.targetFrameTime = 1000 / targetFPS;
    this.force = forceBarnesHut(this.theta);
  }

  /**
   * Get the underlying D3-compatible force
   */
  getForce() {
    return this.force;
  }

  /**
   * Adjust theta based on frame time performance
   */
  adjustPerformance(frameTime: number) {
    this.lastFrameTime = frameTime;

    if (frameTime > this.targetFrameTime * 1.5) {
      // Running too slow, increase approximation (higher theta = faster)
      this.theta = Math.min(0.9, this.theta + this.adjustmentRate);
      this.force.theta(this.theta);
    } else if (frameTime < this.targetFrameTime * 0.5) {
      // Running fast, improve quality (lower theta = more accurate)
      this.theta = Math.max(0.3, this.theta - this.adjustmentRate);
      this.force.theta(this.theta);
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics() {
    return {
      theta: this.theta,
      lastFrameTime: this.lastFrameTime,
      targetFrameTime: this.targetFrameTime,
      performance: this.lastFrameTime > 0 
        ? this.targetFrameTime / this.lastFrameTime 
        : 1
    };
  }
}

/**
 * Select optimal execution mode based on node count
 */
export function selectOptimalMode(nodeCount: number, edgeCount: number = 0) {
  const complexity = nodeCount + (edgeCount * 0.1);
  
  if (complexity < 100) {
    return {
      mode: 'standard',
      location: 'mainThread',
      reason: 'Small graph - standard force sufficient'
    };
  } else if (complexity < 1000) {
    return {
      mode: 'barnesHut',
      location: 'mainThread',
      theta: 0.5,
      reason: 'Medium graph - Barnes-Hut on main thread optimal'
    };
  } else if (complexity < 10000) {
    return {
      mode: 'barnesHut',
      location: 'webWorker',
      theta: 0.6,
      reason: 'Large graph - offload to web worker'
    };
  } else {
    return {
      mode: 'barnesHut',
      location: 'webWorker',
      theta: 0.8,
      gpu: true,
      reason: 'Very large graph - use GPU acceleration if available'
    };
  }
}