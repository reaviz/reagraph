import React, {
  FC,
  useMemo,
  useRef,
  useLayoutEffect,
  useEffect,
  forwardRef,
  RefObject
} from 'react';
import { type ThreeElement } from '@react-three/fiber';
import { InstancedEntity, InstancedMesh2 } from '@three.ez/instanced-mesh';
import { Controller } from '@react-spring/core';
import { InternalGraphNode, InternalGraphPosition } from '../../types';
import {
  IcosahedronGeometry,
  MeshBasicMaterial,
  Color,
  Vector3,
  Sphere
} from 'three';
import { extend } from '@react-three/fiber';
import { animationConfig } from '../../utils/animation';
import { useInstanceDrag } from '../../utils/useInstanceDrag';
import { useCameraControls } from '../../CameraControls/useCameraControls';
import { InstancedBillboardRings } from './InstancesMeshRing';
import { fill } from 'three/src/extras/TextureUtils';

// add InstancedMesh2 to the jsx catalog i.e use it as a jsx component
extend({ InstancedMesh2 });

type InstancedData = { nodeId: string; node: InternalGraphNode };

declare module '@react-three/fiber' {
  interface ThreeElements {
    instancedMesh2: ThreeElement<typeof InstancedMesh2>;
  }
}

interface InstancedMeshSphereProps {
  nodes: InternalGraphNode[];
  actives?: string[];
  selections?: string[];
  animated?: boolean;
  draggable?: boolean;
  onNodeDrag?: (node: InternalGraphNode) => void;
  onPointerDown?: (event: any, instanceId: number) => void;
}

const nodeToInstance = (
  node: InternalGraphNode,
  instance: InstancedEntity & InstancedData,
  active: boolean,
  animated: boolean = false
) => {
  instance.nodeId = node.id;
  instance.node = node;

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

    // Target is node position
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
      return;
    }

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
  } else {
    instance.position.copy(
      new Vector3(
        node.position?.x || 0,
        node.position?.y || 0,
        node.position?.z || 0
      )
    );
    instance.updateMatrixPosition();
  }
  instance.scale.setScalar(node.size);
  instance.color = new Color(node.fill);
  instance.opacity = active ? 1.0 : 0.5;
};

export const InstancedMeshSphere = forwardRef<
  InstancedMesh2<InstancedData>,
  InstancedMeshSphereProps
>(
  (
    {
      nodes,
      actives = [],
      animated = false,
      draggable = false,
      selections = [],
      onNodeDrag,
      onPointerDown
    },
    ref
  ) => {
    const meshRef = useRef<InstancedMesh2<InstancedData>>(null);
    const nodesInstanceIdsMap = useRef<Map<string, number>>(new Map());

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
      const perfStart = performance.now();

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
                actives.includes(node.id),
                animated
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
              actives.includes(newNodes[index].id),
              animated
            );
            nodesInstanceIdsMap.current.set(newNodes[index].id, instanceIndex);
            index++;
          });
        }

        // Update the nodeId to instanceId mapping
        nodesInstanceIdsMap.current.clear();
        mesh.instances.forEach((instance, index) => {
          if (instance.nodeId) {
            nodesInstanceIdsMap.current.set(instance.nodeId, index);
          }
        });
      } else {
        mesh.addInstances(nodes.length, (instance, index) => {
          nodeToInstance(
            nodes[index],
            instance,
            actives.includes(nodes[index].id),
            animated
          );
        });
        // Initialize map for new instances
        nodesInstanceIdsMap.current.clear();
        nodes.forEach((node, index) => {
          nodesInstanceIdsMap.current.set(node.id, index);
        });
      }
      // disable frustum culling to avoid flickering when camera zooming (wrongly culled)
      mesh.frustumCulled = false;
      mesh.computeBVH();
      console.info('[log] Perf spheres updating', performance.now() - perfStart);
    }, [nodes, actives, animated, ref]);

    return (
      <>
        <instancedMesh2
          key="instanced-mesh-sphere"
          ref={ref || meshRef}
          args={meshArgs}
          onClick={e => {
            const id = e.instanceId;
            const mesh =
              (ref as React.RefObject<InstancedMesh2<InstancedData>>)
                ?.current || meshRef.current;
            const nodeId = mesh?.instances?.[id]?.nodeId;
            console.log('clicked', nodeId, mesh?.instances.length);
          }}
          onPointerEnter={e => {
            const mesh =
              (ref as React.RefObject<InstancedMesh2<InstancedData>>)
                ?.current || meshRef.current;
            const instance = mesh?.instances?.[e.instanceId];
            if (instance) {
              instance.opacity = 1;
              instance.updateMatrix();
            }
          }}
          onPointerLeave={e => {
            const mesh =
              (ref as React.RefObject<InstancedMesh2<InstancedData>>)
                ?.current || meshRef.current;
            const instance = mesh?.instances?.[e.instanceId];
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
      </>
    );
  }
);
