import React, { FC, useMemo, useRef, useLayoutEffect } from 'react';
import { type ThreeElement } from '@react-three/fiber';
import { InstancedEntity, InstancedMesh2 } from '@three.ez/instanced-mesh';
import { RingGeometry, MeshBasicMaterial, Color, Vector3 } from 'three';
import { extend, useThree } from '@react-three/fiber';
import { InternalGraphNode } from '../../types';

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
  floatingAnimation?: boolean;
  orbitalAnimation?: boolean;
  onRingClick?: (ring: InternalGraphNode) => void;
}

const animationConfig = {
  tension: 120,
  friction: 14,
  mass: 1
};

const ringToInstance = (
  ring: InternalGraphNode,
  instance: InstancedEntity & RingData
) => {
  instance.ringId = ring.id;
  instance.position.set(ring.position.x, ring.position.y, ring.position.z);
  instance.updateMatrixPosition();
  instance.scale.setScalar(ring.size * 2 || 1);
  instance.color = new Color(ring.fill || '#ffffff');
  instance.opacity = 0.8;
};

export const InstancedBillboardRings: FC<InstancedBillboardRingsProps> = ({
  rings,
  animated = false,
  billboardMode = true,
  floatingAnimation = false,
  orbitalAnimation = false,
  onRingClick
}) => {
  const meshRef = useRef<InstancedMesh2<RingData>>(null);
  const { camera } = useThree();

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
    const mesh = meshRef.current;
    if (!mesh || rings.length === 0) return;

    if (mesh.instances?.length) {
      rings.forEach(ring => {
        const id = mesh.instances.findIndex(
          instance => instance.ringId === ring.id
        );
        if (id === -1) {
          mesh.addInstances(1, instance => ringToInstance(ring, instance));
          return;
        }
        const instance = mesh.instances[id];
        ringToInstance(ring, instance);
      });
    } else {
      mesh.addInstances(rings.length, (instance, index) => {
        ringToInstance(rings[index], instance);
      });
    }

    mesh.computeBVH();
  }, [rings, animated, billboardMode]);

  return (
    <instancedMesh2
      key="instanced-billboard-rings"
      ref={meshRef}
      args={meshArgs}
      onClick={e => {
        const id = e.instanceId;
        const ringId = meshRef.current?.instances?.[id]?.ringId;
        const ring = rings.find(r => r.id === ringId);
        if (ring && onRingClick) {
          onRingClick(ring);
        }
      }}
      onPointerEnter={e => {
        const instance = meshRef.current?.instances?.[e.instanceId];
        if (instance) {
          instance.opacity = 1;
          instance.updateMatrix();
        }
      }}
      onPointerLeave={e => {
        const instance = meshRef.current?.instances?.[e.instanceId];
        if (instance) {
          instance.opacity = 0.3;
          instance.updateMatrix();
        }
      }}
    />
  );
};
