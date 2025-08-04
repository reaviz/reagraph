import React, { useRef, useState } from 'react';
import { InstancedEntity, InstancedMesh2 } from '@three.ez/instanced-mesh';
import { Vector3 } from 'three';
import { ThreeEvent } from '@react-three/fiber';

import {
  CollapseProps,
  InternalGraphNode,
  InternalGraphPosition
} from '../../types';

import { useInstanceDrag } from '../../utils/useInstanceDrag';
import { useCameraControls } from '../../CameraControls/useCameraControls';
import { InstancedMeshSphere } from './InstancedMeshSphere';
import { InstancedBillboardRings } from './InstancesMeshRing';
import { useStore } from '../../store';
import { CulledText } from './CulledText';
import { Instance } from './types';

interface InstancedNodesProps {
  nodes: InternalGraphNode[];
  actives?: string[];
  selections?: string[];
  animated?: boolean;
  draggable?: boolean;
  disabled?: boolean;
  onDrag?: (node: InternalGraphNode) => void;

  /**
   * The function to call when the node is clicked.
   */
  onClick?: (
    node: InternalGraphNode,
    props?: CollapseProps,
    event?: ThreeEvent<MouseEvent>
  ) => void;
}

export const InstancedNodes = ({
  nodes,
  animated = false,
  draggable = false,
  selections = [],
  actives = [],
  disabled = false,
  onDrag,
  onClick
}: InstancedNodesProps) => {
  const sphereRef = useRef<InstancedMesh2<Instance> | null>(null);
  const ringMeshRef = useRef<InstancedMesh2<Instance> | null>(null);
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
        setNodePosition(instance.nodeId, {
          x: pos.x,
          y: pos.y,
          z: pos.z
        } as InternalGraphPosition);
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
        if (ringInstance) {
          ringInstance.isDragging = true;
        }
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
        if (ringInstance) {
          ringInstance.isDragging = false;
        }
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
        isDragging={isDragging}
        onPointerDown={(event, instance) => {
          handleDragStart(instance.id, event.point, instance.position);
        }}
        onClick={(event, instance) => {
          const node = instance.node;
          if (!disabled && !instance.isDragging) {
            onClick?.(
              node,
              {
                canCollapse: false,
                isCollapsed: false
              },
              event
            );
          }
        }}
      />
      <InstancedBillboardRings
        ref={ringMeshRef}
        nodes={
          selections.length
            ? nodes.filter(node => selections?.includes(node.id))
            : []
        }
        animated={false}
        draggable={draggable}
        selections={selections}
        isDragging={isDragging}
        onPointerDown={(event, instance) => {
          if (instance) {
            handleDragStart(instance.id, event.point, instance.position);
          }
        }}
      />
      <CulledText
        nodes={nodes}
        selections={[]}
        actives={actives}
        fontSize={32}
        maxWidth={300}
      />
    </>
  );
};
