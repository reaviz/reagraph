import React, { FC, useMemo, useRef, useLayoutEffect, forwardRef } from 'react';
import { type ThreeElement } from '@react-three/fiber';
import { InstancedEntity, InstancedMesh2 } from '@three.ez/instanced-mesh';
import { Controller } from '@react-spring/core';
import { RingGeometry, MeshBasicMaterial, Color, Vector3 } from 'three';
import { extend, useThree } from '@react-three/fiber';
import { InternalGraphNode } from '../../types';
import { animationConfig } from '../../utils/animation';

// Add InstancedMesh2 to the jsx catalog
extend({ InstancedMesh2 });

type RingData = {
  ringId: string;
  targetPosition: Vector3;
  animationSpeed: number;
  hue: number;
};

declare module '@react-three/fiber' {
  interface ThreeElements {
    instancedMesh2: ThreeElement<typeof InstancedMesh2>;
  }
}

interface InstancedBillboardRingsProps {
  rings: InternalGraphNode[];
  animated?: boolean;
  billboardMode?: boolean;
  onRingClick?: (ring: InternalGraphNode) => void;
}


const ringToInstance = (
  ring: InternalGraphNode,
  instance: InstancedEntity & RingData,
  animated: boolean = false
) => {
  instance.ringId = ring.id;

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
      x: ring.position?.x || 0,
      y: ring.position?.y || 0,
      z: ring.position?.z || 0
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
    instance.position.set(ring.position.x, ring.position.y, ring.position.z);
    instance.updateMatrixPosition();
  }

  instance.scale.setScalar(ring.size * 2 || 1);
  instance.color = new Color(ring.fill || '#ffffff');
  instance.opacity = 0.8;
};

export const InstancedBillboardRings = forwardRef<InstancedMesh2<RingData>, InstancedBillboardRingsProps>(({
  rings,
  animated = false,
  billboardMode = true,
  onRingClick
}, ref) => {

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
    const mesh = (ref as React.RefObject<InstancedMesh2<RingData>>)?.current;
    if (!mesh || rings.length === 0) return;

    if (mesh.instances?.length) {
      rings.forEach(ring => {
        const id = mesh.instances.findIndex(
          instance => instance.ringId === ring.id
        );
        if (id === -1) {
          mesh.addInstances(1, instance => ringToInstance(ring, instance, animated));
          return;
        }
        const instance = mesh.instances[id];
        ringToInstance(ring, instance, animated);
      });
    } else {
      mesh.addInstances(rings.length, (instance, index) => {
        ringToInstance(rings[index], instance, animated);
      });
    }

    mesh.frustumCulled = false;
    mesh.computeBVH();
  }, [rings, animated, billboardMode, ref]);

  return (
    <instancedMesh2
      key="instanced-billboard-rings"
      ref={ref}
      args={meshArgs}
      onClick={e => {
        const id = e.instanceId;
        const ringId = (ref as React.RefObject<InstancedMesh2<RingData>>)?.current?.instances?.[id]?.ringId;
        const ring = rings.find(r => r.id === ringId);
        if (ring && onRingClick) {
          onRingClick(ring);
        }
      }}
      onPointerEnter={e => {
        const instance = (ref as React.RefObject<InstancedMesh2<RingData>>)?.current?.instances?.[e.instanceId];
        if (instance) {
          instance.opacity = 1;
          instance.updateMatrix();
        }
      }}
      onPointerLeave={e => {
        const instance = (ref as React.RefObject<InstancedMesh2<RingData>>)?.current?.instances?.[e.instanceId];
        if (instance) {
          instance.opacity = 0.5;
          instance.updateMatrix();
        }
      }}
    />
  );
});
