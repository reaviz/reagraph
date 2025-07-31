import React, { FC, useMemo, useRef, useLayoutEffect } from 'react';
import { type ThreeElement } from '@react-three/fiber';
import { extendBatchedMeshPrototype, getBatchedMeshCount } from '@three.ez/batched-mesh-extensions';
import { Controller } from '@react-spring/core';
import { InternalGraphNode, InternalGraphPosition } from '../../types';
import { IcosahedronGeometry, MeshBasicMaterial, Vector3, RingGeometry, DoubleSide, Matrix4, Quaternion, BatchedMesh } from 'three';
import { extend } from '@react-three/fiber';
import { animationConfig } from '../../utils/animation';
import { useInstanceDrag } from '../../utils/useInstanceDrag';
import { useCameraControls } from '../../CameraControls/useCameraControls';

// Extend BatchedMesh prototype with per-instance uniforms support
extendBatchedMeshPrototype();

// add BatchedMesh to the jsx catalog i.e use it as a jsx component
extend({ BatchedMesh });

declare module '@react-three/fiber' {
  interface ThreeElements {
    batchedMesh: ThreeElement<typeof BatchedMesh>;
  }
}

interface InstancedMeshSphereProps {
  nodes: InternalGraphNode[];
  actives?: string[];
  selections?: string[];
  animated?: boolean;
  draggable?: boolean;
  onNodeDrag?: (node: InternalGraphNode) => void;
}

// Helper function to animate instance position
const animateInstancePosition = (
  mesh: BatchedMesh,
  instanceId: number,
  targetPosition: Vector3,
  currentPosition: Vector3,
  scale: Vector3,
  animated: boolean = false
) => {
  if (animated) {
    // Calculate distance to determine if animation is needed
    const distance = currentPosition.distanceTo(targetPosition);

    if (distance < 0.1) {
      // Too close, just set position directly
      const matrix = new Matrix4().compose(targetPosition, new Quaternion(), scale);
      mesh.setMatrixAt(instanceId, matrix);
      return;
    }

    const controller = new Controller({
      x: currentPosition.x,
      y: currentPosition.y,
      z: currentPosition.z,
      config: animationConfig
    });

    controller.start({
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      onChange: () => {
        const x = controller.springs.x.get();
        const y = controller.springs.y.get();
        const z = controller.springs.z.get();

        const animatedPosition = new Vector3(x, y, z);
        const matrix = new Matrix4().compose(animatedPosition, new Quaternion(), scale);
        mesh.setMatrixAt(instanceId, matrix);
      }
    });
  } else {
    // Set position directly without animation
    const matrix = new Matrix4().compose(targetPosition, new Quaternion(), scale);
    mesh.setMatrixAt(instanceId, matrix);
  }
};

export const BatchedMeshSphere: FC<InstancedMeshSphereProps> = ({
  nodes,
  actives = [],
  selections = [],
  animated = false,
  draggable = false,
  onNodeDrag
}) => {
  const cameraControls = useCameraControls();
  const batchedMeshRef = useRef<BatchedMesh>(null);
  // Track instance positions for animation
  const instancePositions = useRef<Map<string, Vector3>>(new Map());

  // Create sphere geometry
  const sphereGeometry = useMemo(() => {
    const geometry = new IcosahedronGeometry(1, 5);
    return geometry;
  }, []);

  // Create ring geometry using the same pattern as Ring.tsx
  const ringGeometry = useMemo(() => {
    const innerRadius = 0.4;
    const strokeWidth = 0.5;
    const strokeWidthFraction = strokeWidth / 10;
    const outerRadius = innerRadius + strokeWidthFraction;
    const geometry = new RingGeometry(innerRadius, outerRadius, 25);
    return geometry;
  }, []);

  // Single material for both geometries with per-instance uniforms
  const material = useMemo(() => new MeshBasicMaterial({
    transparent: true,
    depthTest: true,
    side: DoubleSide,
    fog: true
  }), []);

  // Calculate BatchedMesh counts based on both geometries
  const batchedMeshCounts = useMemo(() => {
    try {
      // Ensure geometries are properly initialized before calculating counts
      if (!sphereGeometry.attributes.position || !ringGeometry.attributes.position) {
        return { vertexCount: 10000, indexCount: 30000 }; // Fallback values
      }
      return getBatchedMeshCount([sphereGeometry, ringGeometry]);
    } catch (error) {
      console.warn('Error calculating BatchedMesh counts, using fallback:', error);
      return { vertexCount: 10000, indexCount: 30000 }; // Fallback values
    }
  }, [sphereGeometry, ringGeometry]);


  const { handleDragStart } = useInstanceDrag({
    draggable,
    set: (instanceId: number, pos: Vector3) => {
      try {
        if (batchedMeshRef.current && instanceId < nodes.length) {
          // Update the matrix for the sphere instance
          const matrix = new Matrix4();
          batchedMeshRef.current.getMatrixAt(instanceId, matrix);
          matrix.setPosition(pos);
          batchedMeshRef.current.setMatrixAt(instanceId, matrix);

          // Find the corresponding node and call onNodeDrag
          const node = nodes[instanceId];
          if (node && onNodeDrag) {
            const updatedNode = {
              ...node,
              position: { x: pos.x, y: pos.y, z: pos.z } as InternalGraphPosition
            };
            onNodeDrag(updatedNode);
          }
        }
      } catch (error) {
        console.warn('Error during drag operation:', error);
      }
    },
    onDragStart: () => {
      cameraControls.freeze();
    },
    onDragEnd: () => {
      cameraControls.unFreeze();
    }
  });

  // Initialize unified BatchedMesh with both spheres and rings
  useLayoutEffect(() => {
    const mesh = batchedMeshRef.current;
    if (!mesh || nodes.length === 0) return;

    try {
      // Initialize per-instance uniforms schema (only once)
      if (!mesh.uniformsTexture) {
        mesh.initUniformsPerInstance({
          fragment: {
            color: 'vec3',
            opacity: 'float'
          }
        });
      }

      // Clear existing instances
      while (mesh.instanceCount > 0) {
        mesh.deleteInstance(0);
      }

      // Validate geometries before adding them
      if (!sphereGeometry || !sphereGeometry.attributes.position) {
        console.warn('Sphere geometry not properly initialized');
        return;
      }
      if (!ringGeometry || !ringGeometry.attributes.position) {
        console.warn('Ring geometry not properly initialized');
        return;
      }

      // Check indexing consistency - BatchedMesh requires all geometries to have consistent indexing
      const sphereHasIndex = !!sphereGeometry.index;
      const ringHasIndex = !!ringGeometry.index;

      if (sphereHasIndex !== ringHasIndex) {
        // Fix inconsistency by ensuring both have indexes or both don't
        if (sphereHasIndex && !ringHasIndex) {
          // Convert ring to indexed
          const indices = [];
          const positionCount = ringGeometry.attributes.position.count;
          for (let i = 0; i < positionCount; i++) {
            indices.push(i);
          }
          ringGeometry.setIndex(indices);
        } else if (!sphereHasIndex && ringHasIndex) {
          // Convert sphere to indexed
          const indices = [];
          const positionCount = sphereGeometry.attributes.position.count;
          for (let i = 0; i < positionCount; i++) {
            indices.push(i);
          }
          sphereGeometry.setIndex(indices);
        }
      }

      // Add geometries (sphere and ring)
      const sphereGeometryId = mesh.addGeometry(sphereGeometry);
      const ringGeometryId = mesh.addGeometry(ringGeometry);

      // Add instances for all nodes
      nodes.forEach(node => {
        try {
          // Add sphere instance
          const sphereInstanceId = mesh.addInstance(sphereGeometryId);

          // Get current and target positions for animation
          const targetPosition = new Vector3(node.position?.x || 0, node.position?.y || 0, node.position?.z || 0);
          const currentPosition = instancePositions.current.get(`sphere-${node.id}`) || new Vector3(0, 0, 0);
          const scale = new Vector3(node.size || 1, node.size || 1, node.size || 1);

          // Animate or set sphere position
          animateInstancePosition(mesh, sphereInstanceId, targetPosition, currentPosition, scale, animated);

          // Update stored position
          instancePositions.current.set(`sphere-${node.id}`, targetPosition.clone());

          // Set per-instance uniforms for sphere
          const isActive = actives.includes(node.id);
          mesh.setUniformAt(sphereInstanceId, 'color', new Vector3(Math.random(), Math.random(), Math.random()));
          mesh.setUniformAt(sphereInstanceId, 'opacity', isActive ? 1.0 : 0.5);

          // Add ring instance if selected
          if (selections.includes(node.id)) {
            const ringInstanceId = mesh.addInstance(ringGeometryId);

            // Get ring positions for animation
            const ringTargetPosition = new Vector3(node.position?.x || 0, node.position?.y || 0, (node.position?.z || 0) + 0.1);
            const ringCurrentPosition = instancePositions.current.get(`ring-${node.id}`) || new Vector3(0, 0, 0.1);
            const ringScale = new Vector3((node.size || 1) * 3, (node.size || 1) * 3, 1);

            // Animate or set ring position
            animateInstancePosition(mesh, ringInstanceId, ringTargetPosition, ringCurrentPosition, ringScale, animated);

            // Update stored ring position
            instancePositions.current.set(`ring-${node.id}`, ringTargetPosition.clone());

            // Set per-instance uniforms for ring
            mesh.setUniformAt(ringInstanceId, 'color', new Vector3(0.2, 0.67, 1.0)); // Blue color
            mesh.setUniformAt(ringInstanceId, 'opacity', 0.8);
          }
        } catch (nodeError) {
          console.warn('Error processing node:', node.id, nodeError);
        }
      });

    } catch (error) {
      console.error('Error initializing BatchedMesh:', error);
    }
  }, [nodes, actives, selections, animated, sphereGeometry, ringGeometry]);

  return (
    <>
      {/* Unified BatchedMesh for both spheres and rings with per-instance uniforms */}
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <batchedMesh
        key="unified-batched-mesh"
        ref={batchedMeshRef}
        args={[nodes.length * 2, batchedMeshCounts.vertexCount, batchedMeshCounts.indexCount]}
        material={material}
        onPointerDown={e => {
          if (!draggable) return;
          const instanceId = e.instanceId;
          if (instanceId !== undefined) {
            handleDragStart(instanceId, e.point, e.point);
            e.stopPropagation();
          }
        }}
      />
    </>
  );
};
