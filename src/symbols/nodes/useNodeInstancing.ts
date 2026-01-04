/**
 * Hook for managing InstancedMesh rendering of sphere nodes.
 * Uses Three.js instancing for efficient rendering of thousands of nodes
 * with a single draw call.
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Color,
  DoubleSide,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedMesh,
  MeshPhongMaterial,
  Object3D,
  SphereGeometry
} from 'three';

import type { Theme } from '../../themes';
import type { InternalGraphNode } from '../../types';

/** Default maximum number of node instances */
const DEFAULT_MAX_COUNT = 5000;

/** Sphere geometry parameters matching Sphere.tsx */
const SPHERE_RADIUS = 1;
const SPHERE_WIDTH_SEGMENTS = 25;
const SPHERE_HEIGHT_SEGMENTS = 25;

export interface NodeInstancingResult {
  /** The InstancedMesh object for rendering */
  mesh: InstancedMesh;
  /** Map from node ID to instance index for O(1) lookup */
  nodeIdToIndex: Map<string, number>;
  /** Update instance transforms (position, scale) from node data */
  updateTransforms: (nodes: InternalGraphNode[], defaultSize: number) => void;
  /** Update instance colors based on node state and theme */
  updateColors: (
    nodes: InternalGraphNode[],
    theme: Theme,
    actives: string[],
    selections: string[],
    hasSelections: boolean
  ) => void;
  /** Update the instance count to match the number of nodes */
  updateCount: (count: number) => void;
  /** Dispose of resources */
  dispose: () => void;
}

/**
 * Creates and manages an InstancedMesh for efficient sphere node rendering.
 *
 * @param maxCount - Maximum number of node instances (default: 5000)
 * @returns Object containing the mesh and utility functions
 */
export function useNodeInstancing(
  maxCount: number = DEFAULT_MAX_COUNT
): NodeInstancingResult {
  // Create shared sphere geometry (reused across all instances)
  const geometry = useMemo(
    () =>
      new SphereGeometry(
        SPHERE_RADIUS,
        SPHERE_WIDTH_SEGMENTS,
        SPHERE_HEIGHT_SEGMENTS
      ),
    []
  );

  // Create material with settings matching Sphere.tsx
  const material = useMemo(
    () =>
      new MeshPhongMaterial({
        side: DoubleSide,
        transparent: true,
        fog: true,
        // Default color, will be overridden per-instance
        color: 0x7ca0ff,
        emissive: 0x7ca0ff,
        emissiveIntensity: 0.7
      }),
    []
  );

  // Create InstancedMesh
  const mesh = useMemo(() => {
    const instancedMesh = new InstancedMesh(geometry, material, maxCount);
    // Enable dynamic updates for transforms
    instancedMesh.instanceMatrix.setUsage(DynamicDrawUsage);
    // Create instance color buffer
    instancedMesh.instanceColor = new InstancedBufferAttribute(
      new Float32Array(maxCount * 3),
      3
    );
    instancedMesh.instanceColor.setUsage(DynamicDrawUsage);
    // Set frustum culling
    instancedMesh.frustumCulled = true;
    // Initialize with 0 instances
    instancedMesh.count = 0;
    // Add userData for raycasting identification
    instancedMesh.userData = { type: 'node-instances' };
    return instancedMesh;
  }, [geometry, material, maxCount]);

  // Track node ID to instance index mapping
  const nodeIdToIndexRef = useRef<Map<string, number>>(new Map());

  // Temporary objects for transform calculations (reused to avoid GC)
  const tempObject = useMemo(() => new Object3D(), []);
  const tempColor = useMemo(() => new Color(), []);

  /**
   * Updates instance transforms from node positions and sizes.
   */
  const updateTransforms = useCallback(
    (nodes: InternalGraphNode[], defaultSize: number) => {
      const idToIndex = new Map<string, number>();

      for (let i = 0; i < nodes.length && i < maxCount; i++) {
        const node = nodes[i];
        const { position } = node;
        const size = node.size ?? defaultSize;

        // Set position
        tempObject.position.set(position.x, position.y, position.z);
        // Set scale (size)
        tempObject.scale.set(size, size, size);
        // Update matrix
        tempObject.updateMatrix();
        // Apply to instance
        mesh.setMatrixAt(i, tempObject.matrix);

        // Track mapping
        idToIndex.set(node.id, i);
      }

      // Update instance count
      mesh.count = Math.min(nodes.length, maxCount);
      // Mark matrix buffer for upload
      mesh.instanceMatrix.needsUpdate = true;

      // Store mapping
      nodeIdToIndexRef.current = idToIndex;
    },
    [mesh, maxCount, tempObject]
  );

  /**
   * Updates instance colors based on node state (active, selected, etc.)
   */
  const updateColors = useCallback(
    (
      nodes: InternalGraphNode[],
      theme: Theme,
      actives: string[],
      selections: string[],
      hasSelections: boolean
    ) => {
      const activeSet = new Set(actives);
      const selectionSet = new Set(selections);

      for (let i = 0; i < nodes.length && i < maxCount; i++) {
        const node = nodes[i];
        const isActive = activeSet.has(node.id);
        const isSelected = selectionSet.has(node.id);

        // Determine color based on state (matching Node.tsx logic)
        let nodeColor: string;
        if (isSelected || isActive) {
          nodeColor = String(theme.node.activeFill);
        } else {
          nodeColor = node.fill ?? String(theme.node.fill);
        }

        tempColor.set(nodeColor);
        mesh.setColorAt(i, tempColor);
      }

      // Mark color buffer for upload
      if (mesh.instanceColor) {
        mesh.instanceColor.needsUpdate = true;
      }

      // Update material opacity based on selection state
      // When there are selections, non-selected nodes should be dimmed
      if (hasSelections) {
        material.opacity = theme.node.inactiveOpacity;
      } else {
        material.opacity = theme.node.opacity;
      }
    },
    [mesh, maxCount, tempColor, material]
  );

  /**
   * Updates the instance count.
   */
  const updateCount = useCallback(
    (count: number) => {
      mesh.count = Math.min(count, maxCount);
    },
    [mesh, maxCount]
  );

  /**
   * Disposes of resources.
   */
  const dispose = useCallback(() => {
    geometry.dispose();
    material.dispose();
    mesh.dispose();
  }, [geometry, material, mesh]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      dispose();
    };
  }, [dispose]);

  return {
    mesh,
    /**
     * Returns the current nodeIdToIndex map reference.
     * Note: This returns the ref's current value. The map is mutated
     * in-place by updateTransforms, so consumers should re-read this
     * property after calling updateTransforms if they need fresh data.
     */
    get nodeIdToIndex() {
      return nodeIdToIndexRef.current;
    },
    updateTransforms,
    updateColors,
    updateCount,
    dispose
  };
}
