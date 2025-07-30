import React, { FC, useMemo, useRef, useLayoutEffect } from 'react';
import { type ThreeElement } from '@react-three/fiber';
import { InstancedEntity, InstancedMesh2 } from '@three.ez/instanced-mesh';
import { Controller } from '@react-spring/core';
import { InternalGraphNode, InternalGraphPosition } from '../../types';
import { IcosahedronGeometry, MeshBasicMaterial, Color, Vector3 } from 'three';
import { extend } from '@react-three/fiber';
import { animationConfig } from '../../utils/animation';
import { useInstanceDrag } from '../../utils/useInstanceDrag';
import { useCameraControls } from '../../CameraControls/useCameraControls';

// add InstancedMesh2 to the jsx catalog i.e use it as a jsx component
extend({ InstancedMesh2 });

type InstancedData = { nodeId: string, node: InternalGraphNode };

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
  instance.color = new Color(Math.random(), Math.random(), Math.random());
  instance.opacity = active ? 1.0 : 0.5;
};

export const InstancedMeshSphere: FC<InstancedMeshSphereProps> = ({
  nodes,
  actives = [],
  animated = false,
  draggable = false,
  onNodeDrag
}) => {
  const cameraControls = useCameraControls();
  const meshRef = useRef<InstancedMesh2<InstancedData>>(null);

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

  const { handleDragStart } = useInstanceDrag({
    draggable,
    set: (instanceId: number, pos: Vector3) => {
      if (meshRef.current) {
        const instance = meshRef.current.instances[instanceId];
        if (instance) {
          instance.position.copy(pos);
          instance.updateMatrixPosition();

          const updatedNode = {
            ...instance.node,
            position: { x: pos.x, y: pos.y, z: pos.z } as InternalGraphPosition
          };

          onNodeDrag?.(updatedNode);
        }
      }
    },
    onDragStart: () => {
      cameraControls.freeze();
    },
    onDragEnd: () => {
      cameraControls.unFreeze();
    }
  });

  // Initialize mesh and update instances when data changes
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || nodes.length === 0) return;

    if (mesh.instances?.length) {
      nodes.forEach(node => {
        const id = mesh.instances.findIndex(
          instance => instance.nodeId === node.id
        );
        if (id === -1) {
          mesh.addInstances(1, instance =>
            nodeToInstance(node, instance, actives.includes(node.id), animated)
          );

          return;
        }
        const instance = mesh.instances[id];
        nodeToInstance(node, instance, actives.includes(node.id), animated);
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
    }

    mesh.computeBVH();
  }, [nodes, actives, animated]);

  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <instancedMesh2
      key="instanced-mesh-sphere"
      ref={meshRef}
      args={meshArgs}
      // onClick={e => {
      //   const id = e.instanceId;
      //   const nodeId = meshRef.current?.instances?.[id]?.nodeId;
      //   console.log('clicked', nodeId, meshRef.current?.instances.length);
      // }}
      onPointerDown={e => {
        if (!draggable) return;
        const instanceId = e.instanceId;
        const instance = meshRef.current?.instances?.[instanceId];
        if (instance) {
          handleDragStart(instanceId, e.point, instance.position);
          e.stopPropagation();
        }
      }}
    />
  );
};
