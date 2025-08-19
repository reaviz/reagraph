import React, { ReactNode, useLayoutEffect, useMemo, useRef } from 'react';
import { InstancedMesh2 } from '@three.ez/instanced-mesh';
import { Vector3 } from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { useCursor } from '@react-three/drei';

import {
  CollapseProps,
  InstancesRendererProps,
  InternalGraphNode,
  InternalGraphPosition
} from '../../types';

import { useInstanceDrag } from '../../utils/useInstanceDrag';
import { useCameraControls } from '../../CameraControls/useCameraControls';
import { InstancedMeshSphere } from './InstancedMeshSphere';
import { InstancedMeshRings } from './InstancesMeshRing';
import { useStore } from '../../store';
import { Instance } from '../../types';
import { useHoverIntent } from '../../utils/useHoverIntent';
import { updateInstancePosition } from '../../utils/instances';
import { CulledLabels } from '../CulledLabels';
import { InstancedIcon } from './InstancedIcon';

interface InstancedNodesProps {
  nodes: InternalGraphNode[];
  actives?: string[];
  selections?: string[];
  animated?: boolean;
  draggable?: boolean;
  disabled?: boolean;
  renderInstances?: (args: InstancesRendererProps) => ReactNode;
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
  renderInstances,
  onClick,
  onPointerOver,
  onPointerOut
}: InstancedNodesProps) => {
  const instancesRefs = useRef<InstancedMesh2<Instance>[]>([]);
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
  const nodesWithIcon = useMemo(() => nodes.filter(node => node.icon), [nodes]);
  const nodesWithoutIcon = useMemo(
    () => nodes.filter(node => !node.icon),
    [nodes]
  );

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

      instancesRefs.current
        .map(inst => inst?.instances)
        .flat()
        .filter(Boolean)
        .forEach(inst => {
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

  useLayoutEffect(() => {
    if (!renderInstances) {
      instancesRefs.current = [sphereRef.current, ringMeshRef.current];
    }
  }, [renderInstances]);

  if (renderInstances) {
    return renderInstances({
      instancesRef: instancesRefs,
      nodes,
      selections,
      actives,
      animated,
      draggable,
      disabled,
      theme,
      draggingIds,
      hoveredNodeId,
      onPointerOver: pointerOver,
      onPointerOut: pointerOut,
      onPointerDown: (
        event: ThreeEvent<PointerEvent>,
        node: InternalGraphNode,
        instance?: Instance
      ) => {
        handleDragStart(
          instance?.id,
          event.point,
          new Vector3(
            node.position?.x || 0,
            node.position?.y || 0,
            node.position?.z || 0
          ),
          node.id
        );
      },
      onClick: (event: ThreeEvent<MouseEvent>, node: InternalGraphNode) => {
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
      }
    });
  }

  return (
    <>
      {nodesWithoutIcon.length > 0 && (
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
          onPointerDown={(event, node, instance) => {
            if (instance) {
              handleDragStart(
                instance.id,
                event.point,
                instance.position,
                node.id
              );
            }
          }}
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
          onPointerOver={pointerOver}
          onPointerOut={pointerOut}
        />
      )}
      {nodesWithIcon.length > 0 && (
        <InstancedIcon
          nodes={nodesWithIcon}
          selections={selections}
          actives={actives}
          animated={animated}
          draggable={draggable}
          theme={theme}
          draggingIds={draggingIds}
          hoveredNodeId={hoveredNodeId}
          onPointerOver={pointerOver}
          onPointerOut={pointerOut}
          onPointerDown={(event, node) => {
            if (draggable) {
              handleDragStart(
                undefined,
                event.point,
                new Vector3(
                  node.position?.x || 0,
                  node.position?.y || 0,
                  node.position?.z || 0
                ),
                node.id
              );
            }
          }}
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
          }}
        />
      )}
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
        onPointerDown={(event, node, instance) => {
          if (instance) {
            handleDragStart(
              instance.id,
              event.point,
              instance.position,
              node.id
            );
          }
        }}
      />
      <CulledLabels
        nodes={nodes}
        selections={selections}
        actives={actives}
        animated={animated}
        draggable={draggable}
        fontSize={7}
        theme={theme}
        hoveredNodeId={hoveredNodeId}
        draggingIds={draggingIds}
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
        onPointerDown={(event, node) => {
          handleDragStart(
            undefined,
            event.point,
            new Vector3(
              node.position?.x || 0,
              node.position?.y || 0,
              node.position?.z || 0
            ),
            node.id
          );
        }}
      />
    </>
  );
};
