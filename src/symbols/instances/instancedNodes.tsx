import React, { useRef, useState } from 'react';
import { InternalGraphNode, InternalGraphPosition } from '../../types';
import { useInstanceDrag } from '../../utils/useInstanceDrag';
import { useCameraControls } from '../../CameraControls/useCameraControls';
import { Vector3 } from 'three';
import { InstancedMesh2 } from '@three.ez/instanced-mesh';
import { InstancedMeshSphere } from './InstancedMeshSphere';
import { InstancedBillboardRings } from './InstancesMeshRing';
import { useStore } from '../../store';

interface InstancedNodesProps {
  nodes: InternalGraphNode[];
  actives?: string[];
  selections?: string[];
  animated?: boolean;
  draggable?: boolean;
  onNodeDrag?: (node: InternalGraphNode) => void;
}

export const InstancedNodes = ({
  nodes,
  animated = false,
  draggable = false,
  onNodeDrag,
  selections = [],
  actives = []
}: InstancedNodesProps) => {
  const sphereRef = useRef<InstancedMesh2<any>>(null);
  const ringMeshRef = useRef<InstancedMesh2<any>>(null);
  const setNodePosition = useStore(state => state.setNodePosition);
  const addDraggingId = useStore(state => state.addDraggingId);
  const removeDraggingId = useStore(state => state.removeDraggingId);
  const draggingIds = useStore(state => state.draggingIds);
  const isDragging = draggingIds.length > 0;

  const cameraControls = useCameraControls();
  const { handleDragStart } = useInstanceDrag({
    draggable,
    set: (instanceId: number, pos: Vector3) => {
      if (sphereRef.current) {
        const instance = sphereRef.current.instances[instanceId];
        console.log('setNodePosition', instance.nodeId, pos);
        setNodePosition(instance.nodeId, {
          x: pos.x,
          y: pos.y,
          z: pos.z
        } as InternalGraphPosition);
        // if (instance) {
        //   instance.position.copy(pos);
        //   instance.updateMatrixPosition();

        //   // Sync ring position if it exists
        //   if (ringMeshRef.current && selections.includes(instance.nodeId)) {
        //     const ringInstance = ringMeshRef.current.instances.find(
        //       ringInst => ringInst.nodeId === instance.nodeId
        //     );
        //     if (ringInstance) {
        //       ringInstance.position.copy(pos);
        //       ringInstance.updateMatrixPosition();
        //     }
        //   }

        //   const updatedNode = {
        //     ...instance.node,
        //     position: { x: pos.x, y: pos.y, z: pos.z } as InternalGraphPosition
        //   };

        //   onNodeDrag?.(updatedNode);
        // }
      }
    },
    onDragStart: (instanceId: number) => {
      cameraControls.freeze();
      const instance = sphereRef.current?.instances[instanceId];
      if (instance) {
        instance.isDragging = true;
        const ringInstance = ringMeshRef.current.instances.find(
          ringInst => ringInst.nodeId === instance.nodeId
        );
        ringInstance.isDragging = true;
        addDraggingId(instance.nodeId);
      }
    },
    onDragEnd: (instanceId: number) => {
      cameraControls.unFreeze();
      const instance = sphereRef.current?.instances[instanceId];
      if (instance) {
        instance.isDragging = false;
        const ringInstance = ringMeshRef.current.instances.find(
          ringInst => ringInst.nodeId === instance.nodeId
        );
        ringInstance.isDragging = false;
        removeDraggingId(instance.nodeId);
      }
    }
  });

  return (
    <>
      <InstancedMeshSphere
        ref={sphereRef}
        nodes={nodes}
        animated={animated}
        draggable={draggable}
        selections={selections}
        actives={actives}
        onPointerDown={(e, instanceId) => {
          const instance = sphereRef.current?.instances?.[instanceId];
          if (instance) {
            handleDragStart(instanceId, e.point, instance.position);
          }
        }}
      />
      <InstancedBillboardRings
        ref={ringMeshRef}
        nodes={nodes.filter(node => selections?.includes(node.id))}
        animated={animated}
        billboardMode={true}
        draggable={draggable}
        onPointerDown={(e, instanceId) => {
          const instance = ringMeshRef.current?.instances?.[instanceId];
          if (instance) {
            handleDragStart(instanceId, e.point, instance.position);
          }
        }}
      />
    </>
  );
};
