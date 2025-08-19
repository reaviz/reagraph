import React, {
  ReactNode,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { InstancedMesh2 } from '@three.ez/instanced-mesh';
import { Vector3 } from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { Html, useCursor } from '@react-three/drei';

import {
  CollapseProps,
  ContextMenuEvent,
  InstancesRendererProps,
  InternalGraphNode,
  InternalGraphPosition,
  NodeContextMenuProps
} from '../../types';

import { useInstanceDrag } from '../../utils/useInstanceDrag';
import { useCameraControls } from '../../CameraControls/useCameraControls';
import { InstancedMeshSphere } from './InstancedMeshSphere';
import { InstancedMeshRings } from './InstancesMeshRing';
import { useStore } from '../../store';
import { Instance } from '../../types';
import { useHoverIntent } from '../../utils/useHoverIntent';
import { updateInstancePosition } from '../../utils/instances';
import { CulledLabels } from '../labels';
import { InstancedIcon } from './InstancedIcon';

interface InstancedNodesProps {
  /**
   * The nodes to render.
   */
  nodes: InternalGraphNode[];
  /**
   * The nodes that are active.
   */
  actives?: string[];
  /**
   * The nodes that are selected.
   */
  selections?: string[];
  /**
   * Whether the nodes are animated.
   */
  animated?: boolean;
  /**
   * Whether the nodes are draggable.
   */
  draggable?: boolean;
  /**
   * Whether the nodes are disabled.
   */
  disabled?: boolean;
  /**
   * The function to use to render the instances.
   */
  renderInstances?: (args: InstancesRendererProps) => ReactNode;
  /**
   * The context menu for the node.
   */
  contextMenu?: (event: ContextMenuEvent) => ReactNode;

  /**
   * The function to call when the node is right clicked.
   */
  onContextMenu?: (
    node?: InternalGraphNode,
    props?: NodeContextMenuProps
  ) => void;

  /**
   * The function to call when the pointer is over the node.
   */
  onPointerOver?: (
    node: InternalGraphNode,
    event: ThreeEvent<PointerEvent>
  ) => void;

  /**
   * The function to call when the pointer is out of the node.
   */
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
  contextMenu,
  renderInstances,
  onClick,
  onPointerOver,
  onPointerOut,
  onContextMenu
}: InstancedNodesProps) => {
  const instancesRefs = useRef<InstancedMesh2<Instance>[]>([]);
  const sphereRef = useRef<InstancedMesh2<Instance> | null>(null);
  const ringMeshRef = useRef<InstancedMesh2<Instance> | null>(null);
  const nodeInstances = useRef<Map<string, Instance[]>>(new Map());
  const [contextMenuNode, setContextMenuNode] =
    useState<InternalGraphNode | null>(null);
  const theme = useStore(state => state.theme);
  const setNodePosition = useStore(state => state.setNodePosition);
  const addDraggingId = useStore(state => state.addDraggingId);
  const removeDraggingId = useStore(state => state.removeDraggingId);
  const setHoveredNodeId = useStore(state => state.setHoveredNodeId);
  const setCollapsedNodeIds = useStore(state => state.setCollapsedNodeIds);
  const edges = useStore(state => state.edges);
  const collapsedNodeIds = useStore(state => state.collapsedNodeIds);
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

  const isCollapsed = useMemo(() => {
    return collapsedNodeIds.includes(contextMenuNode?.id);
  }, [collapsedNodeIds, contextMenuNode]);

  const canCollapse = useMemo(() => {
    if (!contextMenuNode) return false;
    // If the node has outgoing edges, it can collapse via context menu
    const outboundLinks = edges.filter(l => l.source === contextMenuNode?.id);
    const isCollapsed = collapsedNodeIds.includes(contextMenuNode?.id);

    return outboundLinks.length > 0 || isCollapsed;
  }, [collapsedNodeIds, contextMenuNode, edges]);

  const onCollapse = useCallback(() => {
    if (canCollapse) {
      if (isCollapsed) {
        setCollapsedNodeIds(
          collapsedNodeIds.filter(p => p !== contextMenuNode?.id)
        );
      } else {
        setCollapsedNodeIds([...collapsedNodeIds, contextMenuNode?.id]);
      }
    }
  }, [
    canCollapse,
    collapsedNodeIds,
    contextMenuNode?.id,
    isCollapsed,
    setCollapsedNodeIds
  ]);

  const contextMenuHandler = useCallback(
    (_, node: InternalGraphNode) => {
      if (!disabled) {
        setContextMenuNode(node);
        onContextMenu?.(node, {
          canCollapse,
          isCollapsed,
          onCollapse: onCollapse
        });
      }
    },
    [disabled, canCollapse, isCollapsed, onContextMenu, onCollapse]
  );

  const clickHandler = useCallback(
    (event: ThreeEvent<MouseEvent>, node: InternalGraphNode) => {
      if (!disabled && draggedNodeIdRef.current !== node.id) {
        onClick?.(
          node,
          {
            canCollapse,
            isCollapsed
          },
          event
        );
      }
      draggedNodeIdRef.current = null;
    },
    [disabled, onClick, canCollapse, isCollapsed]
  );

  const contextMenuComponent = useMemo(
    () =>
      contextMenuNode &&
      contextMenu && (
        <Html
          prepend={true}
          center={true}
          position={[
            contextMenuNode.position?.x,
            contextMenuNode.position?.y,
            contextMenuNode.position?.z
          ]}
        >
          {contextMenu({
            data: contextMenuNode,
            canCollapse,
            isCollapsed,
            onCollapse,
            onClose: () => setContextMenuNode(null)
          })}
        </Html>
      ),
    [contextMenuNode, canCollapse, isCollapsed, contextMenu, onCollapse]
  );

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
      onClick: clickHandler
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
            handleDragStart(
              instance.id,
              event.point,
              instance.position,
              node.id
            );
          }}
          onClick={clickHandler}
          onContextMenu={contextMenuHandler}
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
          onContextMenu={contextMenuHandler}
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
          onClick={clickHandler}
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
          handleDragStart(instance.id, event.point, instance.position, node.id);
        }}
      />
      <CulledLabels
        nodes={nodes}
        selections={selections}
        actives={actives}
        animated={animated}
        draggable={draggable}
        theme={theme}
        hoveredNodeId={hoveredNodeId}
        draggingIds={draggingIds}
        onPointerOver={pointerOver}
        onPointerOut={pointerOut}
        onClick={clickHandler}
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
      {contextMenuComponent}
    </>
  );
};
