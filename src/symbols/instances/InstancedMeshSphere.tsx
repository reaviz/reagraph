import React, {
  FC,
  useMemo,
  useRef,
  useLayoutEffect,
  forwardRef,
  RefObject
} from 'react';
import { extend } from '@react-three/fiber';
import { type ThreeElement } from '@react-three/fiber';
import { InstancedMesh2 } from '@three.ez/instanced-mesh';
import { IcosahedronGeometry, MeshBasicMaterial } from 'three';

import { nodeToInstance } from '../../utils/instances';
import { InstancedMeshProps } from './types';
import { InstancedData } from '../../types';

// add InstancedMesh2 to the jsx catalog i.e use it as a jsx component
extend({ InstancedMesh2 });
declare module '@react-three/fiber' {
  interface ThreeElements {
    instancedMesh2: ThreeElement<typeof InstancedMesh2>;
  }
}

export const InstancedMeshSphere = forwardRef<
  InstancedMesh2<InstancedData>,
  InstancedMeshProps
>(
  (
    {
      nodes,
      actives = [],
      animated = false,
      draggable = false,
      selections = [],
      disabled = false,
      draggingIds = [],
      theme,
      hoveredNodeId,
      onPointerDown,
      onPointerUp,
      onPointerOver,
      onPointerOut,
      onClick
    },
    ref
  ) => {
    const meshRef = useRef<InstancedMesh2<InstancedData | null>>(null);

    // Helper function to get current mesh reference
    const getMesh = () =>
      (ref as RefObject<InstancedMesh2<InstancedData>>)?.current ||
      meshRef.current;

    // Create geometry and material
    const geometry = useMemo(() => new IcosahedronGeometry(1, 5), []);
    const material = useMemo(
      () => new MeshBasicMaterial({ transparent: true }),
      []
    );
    const meshArgs = useMemo(
      () => [geometry, material, { createEntities: true }],
      [geometry, material]
    ) as any;

    // Initialize mesh and update instances when data changes
    useLayoutEffect(() => {
      const mesh =
        (ref as RefObject<InstancedMesh2<InstancedData>>)?.current ||
        meshRef.current;
      if (!mesh || nodes.length === 0) return;

      if (mesh.instances?.length) {
        const nodesMap = new Map(nodes.map(node => [node.id, node]));
        // Get existing instance node IDs
        const existingNodeIds = new Set(
          mesh.instances.map(instance => instance.nodeId).filter(Boolean)
        );
        // Find nodes that need new instances
        const newNodes = nodes.filter(node => !existingNodeIds.has(node.id));
        // Update all existing instances at once
        mesh.updateInstances(instance => {
          if (instance.nodeId) {
            const node = nodesMap.get(instance.nodeId);
            if (node) {
              nodeToInstance(
                node,
                instance,
                animated,
                theme,
                actives,
                selections,
                draggingIds,
                hoveredNodeId
              );
            } else {
              mesh.removeInstances(instance.id);
            }
          }
        });

        // Add new instances for new nodes
        if (newNodes.length > 0) {
          let index = 0;
          mesh.addInstances(newNodes.length, (instance, instanceIndex) => {
            nodeToInstance(
              newNodes[index],
              instance,
              animated,
              theme,
              actives,
              selections,
              draggingIds,
              hoveredNodeId
            );
            index++;
          });
        }
      } else {
        mesh.addInstances(nodes.length, (instance, index) => {
          nodeToInstance(
            nodes[index],
            instance,
            animated,
            theme,
            actives,
            selections,
            draggingIds,
            hoveredNodeId
          );
        });
      }
      // disable frustum culling to avoid flickering when camera zooming (wrongly culled)
      mesh.frustumCulled = false;
      mesh.computeBVH();
    }, [
      nodes,
      actives,
      animated,
      ref,
      selections,
      draggingIds,
      theme,
      hoveredNodeId
    ]);

    return (
      <>
        <instancedMesh2
          key="instanced-mesh-sphere"
          ref={ref || meshRef}
          args={meshArgs}
          onClick={e => {
            const instance = getMesh()?.instances?.[e.instanceId];
            onClick?.(e, instance?.node, instance);
          }}
          onPointerDown={e => {
            if (!draggable) return;
            const instance = getMesh()?.instances?.[e.instanceId];
            onPointerDown?.(e, instance?.node, instance);
          }}
          onPointerUp={e => {
            if (!draggable) return;
            const instance = getMesh()?.instances?.[e.instanceId];
            onPointerUp?.(e, instance?.node, instance);
          }}
          onPointerOver={e => {
            const instance = getMesh()?.instances?.[e.instanceId];
            onPointerOver?.(e, instance?.node, instance);
          }}
          onPointerOut={e => {
            const instance = getMesh()?.instances?.[e.instanceId];
            onPointerOut?.(e, instance?.node, instance);
          }}
        />
      </>
    );
  }
);
