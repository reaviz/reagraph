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
import { InstancedMeshRings } from './InstancesMeshRing';
import { useStore } from '../../store';
import { CulledText } from './text/CulledText';
import { Instance } from './types';
import { useHoverIntent } from '../../utils/useHoverIntent';
import { updateInstancePosition } from '../../utils/instances';

interface InstancedNodesProps {
  nodes: InternalGraphNode[];
  actives?: string[];
  selections?: string[];
  animated?: boolean;
  draggable?: boolean;
  disabled?: boolean;
  onDrag?: (node: InternalGraphNode) => void;
  onPointerOver?: (
    node: InternalGraphNode,
    event: ThreeEvent<PointerEvent>
  ) => void;
  onPointerOut?: (
    node: InternalGraphNode,
    event: ThreeEvent<PointerEvent>
  ) => void;

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
  onClick,
  onPointerOver,
  onPointerOut
}: InstancedNodesProps) => {
  const sphereRef = useRef<InstancedMesh2<Instance> | null>(null);
  const ringMeshRef = useRef<InstancedMesh2<Instance> | null>(null);
  const theme = useStore(state => state.theme);
  const setNodePosition = useStore(state => state.setNodePosition);
  const addDraggingId = useStore(state => state.addDraggingId);
  const removeDraggingId = useStore(state => state.removeDraggingId);
  const setHoveredNodeId = useStore(state => state.setHoveredNodeId);
  const draggingIds = useStore(state => state.draggingIds);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  const cameraControls = useCameraControls();
  const { handleDragStart } = useInstanceDrag({
    draggable,
    set: (instanceId: number, pos: Vector3) => {
      if (sphereRef.current) {
        const instance = sphereRef.current.instances[instanceId];
        updateInstancePosition(instance, pos, false);
        setNodePosition(instance.nodeId, {
          x: pos.x,
          y: pos.y,
          z: pos.z
        } as InternalGraphPosition);
        setDraggedNodeId(instance.nodeId);
      }
    },
    onDragStart: (instanceId: number) => {
      cameraControls.freeze();
      const instance = sphereRef.current?.instances[instanceId];
      if (instance) {
        instance.isDragging = true;
        setDraggedNodeId(null);
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

  const { pointerOver, pointerOut } = useHoverIntent({
    disabled: disabled,
    onPointerOver: (event: ThreeEvent<PointerEvent>) => {
      cameraControls.freeze();
      const instanceId = event.instanceId;
      const instance = (event.eventObject as InstancedMesh2<Instance>)
        .instances?.[instanceId];
      if (instance) {
        onPointerOver?.(instance.node, event);
        setHoveredNodeId(instance.nodeId);
      }
    },
    onPointerOut: (event: ThreeEvent<PointerEvent>) => {
      cameraControls.unFreeze();
      const instanceId = event.instanceId;
      const instance = (event.eventObject as InstancedMesh2<Instance>)
        .instances?.[instanceId];
      if (instance) {
        onPointerOut?.(instance.node, event);
      }
      setHoveredNodeId(null);
    }
  });

  return (
    <>
      <InstancedMeshSphere
        ref={sphereRef}
        theme={theme}
        nodes={nodes}
        animated={animated}
        draggable={draggable}
        selections={selections}
        actives={actives}
        draggingIds={draggingIds}
        onPointerDown={(event, instance) => {
          handleDragStart(instance.id, event.point, instance.position);
        }}
        onClick={(event, instance) => {
          const node = instance.node;
          if (
            !disabled &&
            !instance.isDragging &&
            draggedNodeId !== instance.nodeId
          ) {
            onClick?.(
              node,
              {
                canCollapse: false,
                isCollapsed: false
              },
              event
            );
          }
          setDraggedNodeId(null);
        }}
        onPointerOver={pointerOver}
        onPointerOut={pointerOut}
      />
      <InstancedMeshRings
        ref={ringMeshRef}
        theme={theme}
        nodes={
          selections.length
            ? nodes.filter(node => selections?.includes(node.id))
            : []
        }
        animated={false}
        draggable={draggable}
        selections={selections}
        draggingIds={draggingIds}
        onPointerDown={(event, instance) => {
          if (instance) {
            handleDragStart(instance.id, event.point, instance.position);
          }
        }}
      />
      <CulledText
        nodes={nodes}
        theme={theme}
        selections={selections}
        animated={animated}
        actives={actives}
        draggingIds={draggingIds}
        fontSize={32}
        maxWidth={300}
      />
    </>
  );
};
