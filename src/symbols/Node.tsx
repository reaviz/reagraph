import { a, useSpring } from '@react-spring/three';
import { Html, useCursor } from '@react-three/drei';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import type { FC, ReactNode } from 'react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import type { Group } from 'three';

import { useCameraControls } from '../CameraControls/useCameraControls';
import { useStore } from '../store';
import type {
  CollapseProps,
  ContextMenuEvent,
  InternalGraphNode,
  NodeContextMenuProps,
  NodeRenderer
} from '../types';
import { animationConfig } from '../utils';
import { useDrag } from '../utils/useDrag';
import { useHoverIntent } from '../utils/useHoverIntent';
import { Label } from './Label';
import { Icon } from './nodes';
import { Sphere } from './nodes/Sphere';

// LOD: Maximum camera distance at which node labels are visible
// At distances greater than this, labels would be too small to read anyway
// For large graphs (1000+ nodes), default view can be 25000+ units away
// This threshold allows labels to appear after moderate zooming
const LABEL_VISIBILITY_DISTANCE = 15000;

export interface NodeProps {
  /**
   * The unique identifier for the node.
   */
  id: string;

  /**
   * The parent nodes of the node.
   */
  parents?: string[];

  /**
   * Whether the node is disabled.
   */
  disabled?: boolean;

  /**
   * Whether the node is animated.
   */
  animated?: boolean;

  /**
   * Whether the node is draggable.
   */
  draggable?: boolean;

  /**
   * Constrain dragging to the cluster bounds.
   */
  constrainDragging?: boolean;

  /**
   * The url for the label font.
   */
  labelFontUrl?: string;

  /**
   * The function to use to render the node.
   */
  renderNode?: NodeRenderer;

  /**
   * The context menu for the node.
   */
  contextMenu?: (event: ContextMenuEvent) => ReactNode;

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

  /**
   * The function to call when the node is double clicked.
   */
  onDoubleClick?: (
    node: InternalGraphNode,
    event: ThreeEvent<MouseEvent>
  ) => void;

  /**
   * The function to call when the node is right clicked.
   */
  onContextMenu?: (
    node?: InternalGraphNode,
    props?: NodeContextMenuProps
  ) => void;

  /**
   * Triggered after a node was dragged.
   */
  onDragged?: (node: InternalGraphNode) => void;
}

export const Node: FC<NodeProps> = ({
  animated,
  disabled,
  id,
  draggable = false,
  labelFontUrl,
  contextMenu,
  onClick,
  onDoubleClick,
  onPointerOver,
  onDragged,
  onPointerOut,
  onContextMenu,
  renderNode,
  constrainDragging
}) => {
  const cameraControls = useCameraControls();
  const theme = useStore(state => state.theme);
  const node = useStore(state => state.nodes.find(n => n.id === id));
  const edges = useStore(state => state.edges);
  const draggingIds = useStore(state => state.draggingIds);
  const collapsedNodeIds = useStore(state => state.collapsedNodeIds);
  const addDraggingId = useStore(state => state.addDraggingId);
  const removeDraggingId = useStore(state => state.removeDraggingId);
  const setHoveredNodeId = useStore(state => state.setHoveredNodeId);
  const setNodePosition = useStore(state => state.setNodePosition);
  const setCollapsedNodeIds = useStore(state => state.setCollapsedNodeIds);
  const isCollapsed = useStore(state => state.collapsedNodeIds.includes(id));
  const isActive = useStore(state => state.actives?.includes(id));
  const isSelected = useStore(state => state.selections?.includes(id));
  const hasSelections = useStore(state => state.selections?.length > 0);
  const center = useStore(state => state.centerPosition);
  const cluster = useStore(state => state.clusters.get(node.cluster));

  const isDraggingCurrent = draggingIds.includes(id);
  const isDragging = draggingIds.length > 0;

  const {
    position,
    label,
    subLabel,
    size: nodeSize = 7,
    labelVisible = true
  } = node;

  const group = useRef<Group | null>(null);
  const [active, setActive] = useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  const shouldHighlight = active || isSelected || isActive;

  const selectionOpacity = hasSelections
    ? shouldHighlight
      ? theme.node.selectedOpacity
      : theme.node.inactiveOpacity
    : theme.node.opacity;

  const canCollapse = useMemo(() => {
    // If the node has outgoing edges, it can collapse via context menu
    const outboundLinks = edges.filter(l => l.source === id);

    return outboundLinks.length > 0 || isCollapsed;
  }, [edges, id, isCollapsed]);

  const onCollapse = useCallback(() => {
    if (canCollapse) {
      if (isCollapsed) {
        setCollapsedNodeIds(collapsedNodeIds.filter(p => p !== id));
      } else {
        setCollapsedNodeIds([...collapsedNodeIds, id]);
      }
    }
  }, [canCollapse, collapsedNodeIds, id, isCollapsed, setCollapsedNodeIds]);

  const [{ nodePosition, labelPosition }] = useSpring(
    () => ({
      from: {
        nodePosition: center ? [center.x, center.y, 0] : [0, 0, 0],
        labelPosition: [0, -(nodeSize + 7), 2]
      },
      to: {
        nodePosition: position
          ? [
              position.x,
              position.y,
              shouldHighlight ? position.z + 1 : position.z
            ]
          : [0, 0, 0],
        labelPosition: [0, -(nodeSize + 7), 2]
      },
      config: {
        ...animationConfig,
        duration: animated && !isDragging ? undefined : 0
      }
    }),
    [isDraggingCurrent, position, animated, nodeSize, shouldHighlight]
  );

  const bind = useDrag({
    draggable,
    position,
    // If dragging is constrained to the cluster, use the cluster's position as the bounds
    bounds: constrainDragging ? cluster?.position : undefined,
    // @ts-ignore
    set: pos => setNodePosition(id, pos),
    onDragStart: () => {
      addDraggingId(id);
      setActive(true);
    },
    onDragEnd: () => {
      removeDraggingId(id);
      onDragged?.(node);
    }
  });

  useCursor(active && !isDragging && onClick !== undefined, 'pointer');
  useCursor(
    active && draggable && !isDraggingCurrent && onClick === undefined,
    'grab'
  );
  useCursor(isDraggingCurrent, 'grabbing');

  const combinedActiveState = shouldHighlight || isDraggingCurrent;
  const color = combinedActiveState
    ? theme.node.activeFill
    : node.fill || theme.node.fill;

  const { pointerOver, pointerOut } = useHoverIntent({
    disabled: disabled || isDraggingCurrent,
    onPointerOver: (event: ThreeEvent<PointerEvent>) => {
      cameraControls.freeze();
      setActive(true);
      onPointerOver?.(node, event);
      setHoveredNodeId(id);
    },
    onPointerOut: (event: ThreeEvent<PointerEvent>) => {
      cameraControls.unFreeze();
      setActive(false);
      onPointerOut?.(node, event);
      setHoveredNodeId(null);
    }
  });

  // LOD: Track whether label should be visible based on camera distance
  const [isLabelInRange, setIsLabelInRange] = useState(true);
  const wasInRangeRef = useRef(true);
  const lastUpdateTimeRef = useRef(0);
  const pendingUpdateRef = useRef<boolean | null>(null);
  const { camera } = useThree();

  // Check camera distance and update label visibility
  // Debounced to prevent staggering during fast zoom with mouse wheel
  const LOD_UPDATE_DEBOUNCE_MS = 150;

  useFrame(() => {
    if (!label || !position) return;

    // Calculate distance from camera to node position
    const dx = camera.position.x - position.x;
    const dy = camera.position.y - position.y;
    const dz = camera.position.z - (position.z || 0);
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // Account for camera zoom (orthographic cameras use zoom instead of position)
    const zoom = 'zoom' in camera ? (camera as any).zoom : 1;
    const effectiveDistance = distance / zoom;

    const isInRange = effectiveDistance < LABEL_VISIBILITY_DISTANCE;

    // Only update state when visibility changes, with debouncing
    if (isInRange !== wasInRangeRef.current) {
      const now = performance.now();
      pendingUpdateRef.current = isInRange;

      // Debounce: only apply the update after the debounce period
      if (now - lastUpdateTimeRef.current >= LOD_UPDATE_DEBOUNCE_MS) {
        wasInRangeRef.current = isInRange;
        setIsLabelInRange(isInRange);
        lastUpdateTimeRef.current = now;
        pendingUpdateRef.current = null;
      }
    } else if (pendingUpdateRef.current !== null) {
      // Apply any pending update after debounce period
      const now = performance.now();
      if (now - lastUpdateTimeRef.current >= LOD_UPDATE_DEBOUNCE_MS) {
        wasInRangeRef.current = pendingUpdateRef.current;
        setIsLabelInRange(pendingUpdateRef.current);
        lastUpdateTimeRef.current = now;
        pendingUpdateRef.current = null;
      }
    }
  });

  const nodeComponent = useMemo(
    () =>
      renderNode ? (
        renderNode({
          id,
          color,
          size: nodeSize,
          active: combinedActiveState,
          opacity: selectionOpacity,
          animated,
          selected: isSelected,
          node
        })
      ) : (
        <>
          {node.icon ? (
            <Icon
              id={id}
              image={node.icon || ''}
              size={nodeSize + 8}
              opacity={selectionOpacity}
              animated={animated}
              color={color}
              node={node}
              active={combinedActiveState}
              selected={isSelected}
            />
          ) : (
            <Sphere
              id={id}
              size={nodeSize}
              opacity={selectionOpacity}
              animated={animated}
              color={color}
              node={node}
              active={combinedActiveState}
              selected={isSelected}
            />
          )}
        </>
      ),
    [
      renderNode,
      id,
      color,
      nodeSize,
      combinedActiveState,
      selectionOpacity,
      animated,
      isSelected,
      node
    ]
  );

  // LOD: Only show label when camera is close enough AND labelVisible is true
  const shouldShowLabel = labelVisible && label && isLabelInRange;

  const labelComponent = useMemo(
    () =>
      shouldShowLabel &&
      (labelVisible || isSelected || active) && (
        <a.group position={labelPosition as any}>
          <Label
            text={label}
            fontUrl={labelFontUrl}
            opacity={selectionOpacity}
            stroke={theme.node.label.stroke}
            backgroundColor={theme.node.label.backgroundColor}
            backgroundOpacity={theme.node.label.backgroundOpacity}
            padding={theme.node.label.padding}
            strokeColor={theme.node.label.strokeColor}
            strokeWidth={theme.node.label.strokeWidth}
            radius={theme.node.label.radius}
            active={isSelected || active || isDraggingCurrent || isActive}
            color={
              isSelected || active || isDraggingCurrent || isActive
                ? theme.node.label.activeColor
                : theme.node.label.color
            }
          />
          {subLabel && (
            <group position={[0, -(nodeSize - 3), 0]}>
              <Label
                text={subLabel}
                fontUrl={labelFontUrl}
                fontSize={5}
                opacity={selectionOpacity}
                stroke={theme.node.subLabel?.stroke}
                active={isSelected || active || isDraggingCurrent || isActive}
                color={
                  isSelected || active || isDraggingCurrent || isActive
                    ? theme.node.subLabel?.activeColor
                    : theme.node.subLabel?.color
                }
              />
            </group>
          )}
        </a.group>
      ),
    [
      active,
      isActive,
      isDraggingCurrent,
      isSelected,
      label,
      labelFontUrl,
      labelPosition,
      labelVisible,
      nodeSize,
      selectionOpacity,
      shouldShowLabel,
      subLabel,
      theme.node.label.activeColor,
      theme.node.label.color,
      theme.node.label.stroke,
      theme.node.label.backgroundColor,
      theme.node.label.backgroundOpacity,
      theme.node.label.padding,
      theme.node.label.strokeColor,
      theme.node.label.strokeWidth,
      theme.node.label.radius,
      theme.node.subLabel?.activeColor,
      theme.node.subLabel?.color,
      theme.node.subLabel?.stroke
    ]
  );

  const menuComponent = useMemo(
    () =>
      menuVisible &&
      contextMenu && (
        <Html prepend={true} center={true}>
          {contextMenu({
            data: node,
            canCollapse,
            isCollapsed,
            onCollapse,
            onClose: () => setMenuVisible(false)
          })}
        </Html>
      ),
    [menuVisible, contextMenu, node, canCollapse, isCollapsed, onCollapse]
  );

  return (
    <a.group
      renderOrder={1}
      userData={{ id, type: 'node' }}
      ref={group}
      position={nodePosition as any}
      onPointerOver={pointerOver}
      onPointerOut={pointerOut}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        if (!disabled && !isDraggingCurrent) {
          onClick?.(
            node,
            {
              canCollapse,
              isCollapsed
            },
            event
          );
        }
      }}
      onDoubleClick={(event: ThreeEvent<MouseEvent>) => {
        if (!disabled && !isDraggingCurrent) {
          onDoubleClick?.(node, event);
        }
      }}
      onContextMenu={() => {
        if (!disabled) {
          setMenuVisible(true);
          onContextMenu?.(node, {
            canCollapse,
            isCollapsed,
            onCollapse
          });
        }
      }}
      {...(bind() as any)}
    >
      {nodeComponent}
      {menuComponent}
      {labelComponent}
    </a.group>
  );
};
