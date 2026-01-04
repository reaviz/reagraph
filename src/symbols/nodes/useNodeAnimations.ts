/**
 * Centralized animation hook for instanced nodes.
 * Replaces O(n) useSpring hooks with a single useFrame loop
 * using manual lerp interpolation.
 */

import { useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';
import { InstancedMesh, Object3D, Vector3 } from 'three';

import type { InternalGraphNode } from '../../types';

/** Lerp factor for smooth animation convergence (matches edge animation) */
const LERP_FACTOR = 0.15;

/** Threshold below which we consider positions equal (to stop animating) */
const POSITION_THRESHOLD = 0.01;

/** Threshold for scale animation */
const SCALE_THRESHOLD = 0.001;

export interface NodeAnimationState {
  /** Current animated positions */
  positions: Float32Array;
  /** Current animated scales */
  scales: Float32Array;
  /** Target positions from node data */
  targetPositions: Float32Array;
  /** Target scales from node data */
  targetScales: Float32Array;
  /** Whether any animation is currently in progress */
  isAnimating: boolean;
}

/**
 * Hook for animating instanced node positions and scales.
 * Uses a single useFrame loop with lerp interpolation instead of
 * per-node useSpring hooks.
 *
 * @param mesh - The InstancedMesh to animate
 * @param nodes - Current node data with positions
 * @param nodeIdToIndex - Mapping from node ID to instance index
 * @param animated - Whether animations are enabled
 * @param defaultSize - Default node size
 */
export function useNodePositionAnimation(
  mesh: InstancedMesh,
  nodes: InternalGraphNode[],
  nodeIdToIndex: Map<string, number>,
  animated: boolean,
  defaultSize: number
): void {
  // Store current animated state
  const stateRef = useRef<NodeAnimationState | null>(null);

  // Track if this is the first render (for initial snap)
  const isFirstRenderRef = useRef(true);

  // Track previous node count for topology changes
  const prevNodeCountRef = useRef(0);

  // Temporary objects for matrix operations (reused to avoid GC)
  const tempObject = useRef(new Object3D());
  const tempPosition = useRef(new Vector3());

  /**
   * Initialize or resize animation state arrays.
   */
  const initializeState = useCallback(
    (nodeCount: number) => {
      const positions = new Float32Array(nodeCount * 3);
      const scales = new Float32Array(nodeCount);
      const targetPositions = new Float32Array(nodeCount * 3);
      const targetScales = new Float32Array(nodeCount);

      // Initialize with current/target positions
      for (let i = 0; i < nodeCount; i++) {
        const node = nodes[i];
        if (!node) continue;

        const { position } = node;
        const size = node.size ?? defaultSize;

        const i3 = i * 3;
        // If first render or topology changed, snap to target immediately
        if (isFirstRenderRef.current || nodeCount !== prevNodeCountRef.current) {
          positions[i3] = position.x;
          positions[i3 + 1] = position.y;
          positions[i3 + 2] = position.z;
          scales[i] = size;
        } else if (stateRef.current) {
          // Preserve existing animated positions where possible
          const existingIndex = nodeIdToIndex.get(node.id);
          if (existingIndex !== undefined && existingIndex < stateRef.current.positions.length / 3) {
            const ei3 = existingIndex * 3;
            positions[i3] = stateRef.current.positions[ei3];
            positions[i3 + 1] = stateRef.current.positions[ei3 + 1];
            positions[i3 + 2] = stateRef.current.positions[ei3 + 2];
            scales[i] = stateRef.current.scales[existingIndex];
          } else {
            // New node - start at target position
            positions[i3] = position.x;
            positions[i3 + 1] = position.y;
            positions[i3 + 2] = position.z;
            scales[i] = animated ? 0.00001 : size; // Grow-in animation
          }
        }

        // Set targets
        targetPositions[i3] = position.x;
        targetPositions[i3 + 1] = position.y;
        targetPositions[i3 + 2] = position.z;
        targetScales[i] = size;
      }

      stateRef.current = {
        positions,
        scales,
        targetPositions,
        targetScales,
        isAnimating: animated
      };

      isFirstRenderRef.current = false;
      prevNodeCountRef.current = nodeCount;
    },
    [nodes, nodeIdToIndex, animated, defaultSize]
  );

  /**
   * Update target positions from node data.
   */
  const updateTargets = useCallback(() => {
    const state = stateRef.current;
    if (!state) return;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node) continue;

      const { position } = node;
      const size = node.size ?? defaultSize;

      const i3 = i * 3;
      state.targetPositions[i3] = position.x;
      state.targetPositions[i3 + 1] = position.y;
      state.targetPositions[i3 + 2] = position.z;
      state.targetScales[i] = size;
    }

    state.isAnimating = true;
  }, [nodes, defaultSize]);

  // Initialize state when nodes change
  useEffect(() => {
    const nodeCount = nodes.length;

    // Check if we need to reinitialize (topology change)
    if (
      !stateRef.current ||
      stateRef.current.positions.length !== nodeCount * 3
    ) {
      initializeState(nodeCount);
    } else {
      // Just update targets
      updateTargets();
    }

    // If not animated, immediately update mesh transforms
    if (!animated && stateRef.current) {
      applyTransformsToMesh();
    }
  }, [nodes, initializeState, updateTargets, animated]);

  /**
   * Apply current animation state to the InstancedMesh.
   */
  const applyTransformsToMesh = useCallback(() => {
    const state = stateRef.current;
    if (!state || !mesh) return;

    const { positions, scales } = state;
    const nodeCount = nodes.length;

    for (let i = 0; i < nodeCount; i++) {
      const i3 = i * 3;
      const pos = tempPosition.current;
      const scale = scales[i];

      pos.set(positions[i3], positions[i3 + 1], positions[i3 + 2]);

      tempObject.current.position.copy(pos);
      tempObject.current.scale.set(scale, scale, scale);
      tempObject.current.updateMatrix();

      mesh.setMatrixAt(i, tempObject.current.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  }, [mesh, nodes.length]);

  // Single useFrame for all node animations
  useFrame(() => {
    const state = stateRef.current;
    if (!state || !animated || !state.isAnimating) return;

    const { positions, scales, targetPositions, targetScales } = state;
    let needsUpdate = false;
    let stillAnimating = false;

    const nodeCount = Math.min(nodes.length, positions.length / 3);

    for (let i = 0; i < nodeCount; i++) {
      const i3 = i * 3;

      // Lerp position
      const dx = targetPositions[i3] - positions[i3];
      const dy = targetPositions[i3 + 1] - positions[i3 + 1];
      const dz = targetPositions[i3 + 2] - positions[i3 + 2];

      if (
        Math.abs(dx) > POSITION_THRESHOLD ||
        Math.abs(dy) > POSITION_THRESHOLD ||
        Math.abs(dz) > POSITION_THRESHOLD
      ) {
        positions[i3] += dx * LERP_FACTOR;
        positions[i3 + 1] += dy * LERP_FACTOR;
        positions[i3 + 2] += dz * LERP_FACTOR;
        needsUpdate = true;
        stillAnimating = true;
      } else {
        // Snap to target when close enough
        positions[i3] = targetPositions[i3];
        positions[i3 + 1] = targetPositions[i3 + 1];
        positions[i3 + 2] = targetPositions[i3 + 2];
      }

      // Lerp scale
      const ds = targetScales[i] - scales[i];
      if (Math.abs(ds) > SCALE_THRESHOLD) {
        scales[i] += ds * LERP_FACTOR;
        needsUpdate = true;
        stillAnimating = true;
      } else {
        scales[i] = targetScales[i];
      }
    }

    // Update mesh if any instance changed
    if (needsUpdate) {
      applyTransformsToMesh();
    }

    // Stop animating when all nodes have reached targets
    state.isAnimating = stillAnimating;
  });
}
