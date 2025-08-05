import React, {
  useMemo,
  useRef,
  useLayoutEffect,
  forwardRef,
  RefObject,
  useState
} from 'react';
import { type ThreeElement } from '@react-three/fiber';
import { useCursor } from '@react-three/drei';
import { InstancedEntity, InstancedMesh2 } from '@three.ez/instanced-mesh';
import {
  RingGeometry,
  MeshBasicMaterial,
  Color,
  DoubleSide,
  Vector3
} from 'three';
import { extend } from '@react-three/fiber';

import { InternalGraphNode } from '../../types';
import {
  getInstanceColor,
  updateInstancePosition
} from '../../utils/instances';
import { InstancedData, InstancedMeshProps } from './types';

// Add InstancedMesh2 to the jsx catalog
extend({ InstancedMesh2 });

declare module '@react-three/fiber' {
  interface ThreeElements {
    instancedMesh2: ThreeElement<typeof InstancedMesh2>;
  }
}

/**
 * Convert a node to an instance for the ring mesh
 * @param node - The node to convert to an instance
 * @param instance - The instance to update
 * @param animated - Whether to animate the instance
 * @param theme - The theme to use
 * @param actives - The active nodes
 * @param selections - The selected nodes
 */
const ringToInstance = (
  node: InternalGraphNode,
  instance: InstancedEntity & InstancedData,
  animated: boolean = false,
  theme: any,
  actives: string[] = [],
  selections: string[] = []
) => {
  instance.nodeId = node.id;
  instance.node = node;

  updateInstancePosition(
    instance,
    node.position as unknown as Vector3,
    animated
  );
  instance.updateMatrixPosition();
  instance.scale.setScalar(node.size * 2 || 1);
  instance.color = getInstanceColor(
    node,
    theme,
    actives,
    selections,
    instance.isDragging
  );
  instance.opacity = 1;
};

export const InstancedBillboardRings = forwardRef<
  InstancedMesh2<InstancedData>,
  InstancedMeshProps
>(
  (
    {
      nodes,
      animated = false,
      draggable = false,
      selections = [],
      actives = [],
      theme,
      onPointerDown
    },
    ref
  ) => {
    const meshRef = useRef<InstancedMesh2<InstancedData>>(null);
    const [hovered, setHovered] = useState<boolean>(false);

    useCursor(hovered);

    // Create geometry and material
    const geometry = useMemo(() => new RingGeometry(1.1, 1.25, 64), []);
    const material = useMemo(
      () =>
        new MeshBasicMaterial({
          transparent: true,
          side: DoubleSide
        }),
      []
    );

    const meshArgs = useMemo(
      () => [geometry, material, { createEntities: true }],
      [geometry, material]
    ) as any;

    // Initialize mesh and update instances when data changes
    useLayoutEffect(() => {
      const mesh = (ref as RefObject<InstancedMesh2<InstancedData>>)?.current;
      if (!mesh) return;

      mesh.clearInstances();
      mesh.addInstances(nodes.length, (instance, index) =>
        ringToInstance(
          nodes[index],
          instance,
          animated,
          theme,
          actives,
          selections
        )
      );

      mesh.frustumCulled = false;
      mesh.computeBVH();
    }, [nodes, animated, theme, actives, selections, ref]);

    // Helper function to get current mesh reference
    const getMesh = () =>
      (ref as RefObject<InstancedMesh2<InstancedData>>)?.current ||
      meshRef.current;

    return (
      <instancedMesh2
        key="instanced-billboard-rings"
        ref={ref || meshRef}
        args={meshArgs}
        onPointerEnter={e => {
          setHovered(true);
          const instance = getMesh()?.instances?.[e.instanceId];
          if (instance) {
            instance.color = theme.node.activeFill;
            instance.updateMatrix();
          }
        }}
        onPointerLeave={e => {
          setHovered(false);
          const instance = getMesh()?.instances?.[e.instanceId];
          if (instance) {
            instance.color = getInstanceColor(
              instance.node,
              theme,
              actives,
              selections,
              instance.isDragging
            );
            instance.updateMatrix();
          }
        }}
        onPointerDown={e => {
          if (!draggable) return;
          const instance = getMesh()?.instances?.[e.instanceId];
          if (instance) {
            onPointerDown?.(e, instance);
          }
        }}
      />
    );
  }
);
