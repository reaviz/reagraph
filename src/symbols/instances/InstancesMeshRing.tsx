import React, {
  FC,
  useMemo,
  useRef,
  useLayoutEffect,
  forwardRef,
  RefObject
} from 'react';
import { type ThreeElement } from '@react-three/fiber';
import { InstancedEntity, InstancedMesh2 } from '@three.ez/instanced-mesh';
import { Controller } from '@react-spring/core';
import { RingGeometry, MeshBasicMaterial, Color, Vector3 } from 'three';
import { extend, useThree } from '@react-three/fiber';
import { InternalGraphNode } from '../../types';
import { animationConfig } from '../../utils/animation';

// Add InstancedMesh2 to the jsx catalog
extend({ InstancedMesh2 });

type InstancedData = { nodeId: string; node: InternalGraphNode };

declare module '@react-three/fiber' {
  interface ThreeElements {
    instancedMesh2: ThreeElement<typeof InstancedMesh2>;
  }
}

interface InstancedBillboardRingsProps {
  nodes: InternalGraphNode[];
  animated?: boolean;
  draggable?: boolean;
  billboardMode?: boolean;
  onRingClick?: (ring: InternalGraphNode) => void;
  onPointerDown?: (event: any, instanceId: number) => void;
}

const ringToInstance = (
  node: InternalGraphNode,
  instance: InstancedEntity & InstancedData,
  animated: boolean = false
) => {
  instance.nodeId = node.id;

  if (animated) {
    // For initial render animation, start from center if instance is at origin
    const isAtOrigin =
      instance.position.x === 0 &&
      instance.position.y === 0 &&
      instance.position.z === 0;
    const startPosition = {
      x: isAtOrigin ? 0 : instance.position.x,
      y: isAtOrigin ? 0 : instance.position.y,
      z: isAtOrigin ? 0 : instance.position.z
    };

    // Target is ring position
    const targetPosition = {
      x: node.position?.x || 0,
      y: node.position?.y || 0,
      z: node.position?.z || 0
    };

    // Skip animation if already at target (avoid unnecessary animation)
    const distance = Math.sqrt(
      Math.pow(targetPosition.x - startPosition.x, 2) +
        Math.pow(targetPosition.y - startPosition.y, 2) +
        Math.pow(targetPosition.z - startPosition.z, 2)
    );

    if (distance < 0.1) {
      // Too close, just set position directly
      instance.position.set(
        targetPosition.x,
        targetPosition.y,
        targetPosition.z
      );
      instance.updateMatrixPosition();
    } else {
      const controller = new Controller({
        x: startPosition.x,
        y: startPosition.y,
        z: startPosition.z,
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

          instance.position.set(x, y, z);
          instance.updateMatrixPosition();
        }
      });
    }
  } else {
    instance.position.set(node.position.x, node.position.y, node.position.z);
    instance.updateMatrixPosition();
  }

  instance.scale.setScalar(node.size * 2 || 1);
  instance.color = new Color(node.fill || '#ffffff');
  instance.opacity = 0.8;
};

export const InstancedBillboardRings = forwardRef<
  InstancedMesh2<InstancedData>,
  InstancedBillboardRingsProps
>(
  (
    {
      nodes,
      animated = false,
      draggable = false,
      billboardMode = true,
      onRingClick,
      onPointerDown
    },
    ref
  ) => {
    const meshRef = useRef<InstancedMesh2<InstancedData>>(null);
    // Create geometry and material
    const geometry = useMemo(() => new RingGeometry(0.7, 0.85, 64), []);
    const material = useMemo(
      () =>
        new MeshBasicMaterial({
          transparent: true,
          side: 2 // DoubleSide
        }),
      []
    );

    const meshArgs = useMemo(
      () => [geometry, material, { createEntities: true }],
      [geometry, material]
    ) as any;

    // Initialize mesh and update instances when data changes
    useLayoutEffect(() => {
      const mesh = (ref as React.RefObject<InstancedMesh2<InstancedData>>)
        ?.current;
      if (!mesh || nodes.length === 0) return;
      const perfStart = performance.now();

      if (mesh.instances?.length) {
        const nodesMap = new Map(nodes.map(node => [node.id, node]));
        // Find nodes that need new instances
        const newNodes = nodes.filter(node => !nodesMap.has(node.id));

        mesh.updateInstances(instance => {
          if (instance.nodeId) {
            const node = nodesMap.get(instance.nodeId);
            if (node) {
              ringToInstance(node, instance, animated);
            } else {
              mesh.removeInstances(instance.id);
            }
          }
        });

        // Add new instances for new nodes
        if (newNodes.length > 0) {
          let index = 0;
          mesh.addInstances(newNodes.length, (instance, instanceIndex) => {
            ringToInstance(
              newNodes[index],
              instance,
            );
            index++;
          });
        }
      } else {
        mesh.addInstances(nodes.length, (instance, index) => {
          ringToInstance(nodes[index], instance, animated);
        });
      }

      mesh.frustumCulled = false;
      mesh.computeBVH();
      console.info('[log] Perf rings updating', performance.now() - perfStart);
    }, [nodes, animated, billboardMode, ref]);

    return (
      <instancedMesh2
        key="instanced-billboard-rings"
        ref={ref || meshRef}
        args={meshArgs}
        onClick={e => {
          const id = e.instanceId;
          const nodeId = (ref as RefObject<InstancedMesh2<InstancedData>>)
            ?.current?.instances?.[id]?.nodeId;
          const node = nodes.find(n => n.id === nodeId);
          if (node && onRingClick) {
            onRingClick(node);
          }
        }}
        onPointerEnter={e => {
          const instance = (ref as RefObject<InstancedMesh2<InstancedData>>)
            ?.current?.instances?.[e.instanceId];
          if (instance) {
            instance.opacity = 1;
            instance.updateMatrix();
          }
        }}
        onPointerLeave={e => {
          const instance = (ref as RefObject<InstancedMesh2<InstancedData>>)
            ?.current?.instances?.[e.instanceId];
          if (instance) {
            instance.opacity = 0.5;
            instance.updateMatrix();
          }
        }}
        onPointerDown={e => {
          if (!draggable) return;
          onPointerDown?.(e, e.instanceId);
        }}
      />
    );
  }
);
