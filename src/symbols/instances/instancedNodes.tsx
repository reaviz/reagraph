import React, { useRef } from 'react';
import { InstancedMesh2 } from '@three.ez/instanced-mesh';
import { Vector3 } from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { useCursor } from '@react-three/drei';

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
import { Instance } from './types';
import { useHoverIntent } from '../../utils/useHoverIntent';
import { updateInstancePosition } from '../../utils/instances';
import { CulledLabels } from '../CulledLabels';

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
  const nodeInstances = useRef<Map<string, Instance[]>>(new Map());
  const theme = useStore(state => state.theme);
  const setNodePosition = useStore(state => state.setNodePosition);
  const addDraggingId = useStore(state => state.addDraggingId);
  const removeDraggingId = useStore(state => state.removeDraggingId);
  const setHoveredNodeId = useStore(state => state.setHoveredNodeId);
  const hoveredNodeId = useStore(state => state.hoveredNodeId);
  const draggingIds = useStore(state => state.draggingIds);
  const draggedNodeIdRef = useRef<string | null>(null);

  useCursor(hoveredNodeId !== null);
  useCursor(draggingIds.length > 0, 'grabbing');

  const cameraControls = useCameraControls();
  const { handleDragStart } = useInstanceDrag({
    draggable,
    set: (nodeId: string, pos: Vector3) => {
      const instances = nodeInstances.current.get(nodeId);
      // Update instances position directly due to performance reasons
      instances?.forEach(inst => updateInstancePosition(inst, pos, false));
      draggedNodeIdRef.current = nodeId;
      setNodePosition(nodeId, {
        x: pos.x,
        y: pos.y,
        z: pos.z
      } as InternalGraphPosition);
    },
    onDragStart: (nodeId?: string) => {
      cameraControls.freeze();

      [
        ...(sphereRef.current?.instances || []),
        ...(ringMeshRef.current?.instances || [])
      ].forEach(inst => {
        nodeInstances.current.set(inst.nodeId, [
          ...(nodeInstances.current.get(inst.nodeId) || []),
          inst
        ]);
      });
      nodeInstances.current.get(nodeId)?.forEach(inst => {
        inst.isDragging = true;
      });

      addDraggingId(nodeId);
    },
    onDragEnd: (nodeId: string) => {
      cameraControls.unFreeze();
      const instances = nodeInstances.current.get(nodeId);
      instances?.forEach(inst => (inst.isDragging = false));
      nodeInstances.current.clear();
      removeDraggingId(nodeId);
    }
  });

  const { pointerOver, pointerOut } = useHoverIntent({
    disabled: disabled,
    onPointerOver: (event: ThreeEvent<PointerEvent>) => {
      cameraControls.freeze();
      const node = event.eventObject.userData.node;
      if (node) {
        onPointerOver?.(node, event);
        setHoveredNodeId(node.id);
      } else {
        const instanceId = event.instanceId;
        const instance = (event.eventObject as InstancedMesh2<Instance>)
          .instances?.[instanceId];
        if (instance) {
          onPointerOver?.(instance.node, event);
          setHoveredNodeId(instance.nodeId);
        }
      }
    },
    onPointerOut: (event: ThreeEvent<PointerEvent>) => {
      cameraControls.unFreeze();
      const node = event.eventObject.userData.node;
      if (node) {
        onPointerOut?.(node, event);
      } else {
        const instanceId = event.instanceId;
        const instance = (event.eventObject as InstancedMesh2<Instance>)
          .instances?.[instanceId];
        if (instance) {
          onPointerOut?.(instance.node, event);
        }
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
        hoveredNodeId={hoveredNodeId}
        onPointerDown={(event, instance) => {
          if (instance) {
            handleDragStart(
              instance.id,
              event.point,
              instance.position,
              instance.nodeId
            );
          }
        }}
        onClick={(event, instance) => {
          const node = instance.node;
          if (
            !disabled &&
            !instance.isDragging &&
            draggedNodeIdRef.current !== instance.nodeId
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
          draggedNodeIdRef.current = null;
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
            handleDragStart(
              instance.id,
              event.point,
              instance.position,
              instance.nodeId
            );
          }
        }}
      />
      <CulledLabels
        nodes={nodes}
        selections={selections}
        actives={actives}
        animated={animated}
        fontSize={7}
        theme={theme}
        hoveredNodeId={hoveredNodeId}
        onPointerOver={pointerOver}
        onPointerOut={pointerOut}
        onClick={(event, node) => {
          if (!disabled && draggedNodeIdRef.current !== node.id) {
            onClick?.(
              node,
              {
                canCollapse: false,
                isCollapsed: false
              },
              event
            );
          }
          draggedNodeIdRef.current = null;
        }}
      />
    </>
  );
};
