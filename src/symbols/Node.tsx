import React, {
  FC,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState
} from 'react';
import { Group } from 'three';
import { animationConfig } from '../utils';
import { useSpring, a } from '@react-spring/three';
import { Sphere } from './nodes/Sphere';
import { Label } from './Label';
import { Theme } from '../themes';
import { Ring } from './Ring';
import {
  NodeContextMenuProps,
  ContextMenuEvent,
  InternalGraphNode,
  NodeRenderer,
  CollapseProps
} from '../types';
import { Html, useCursor } from '@react-three/drei';
import { useCameraControls } from '../CameraControls';
import { useStore } from '../store';
import { useDrag } from '../utils/useDrag';
import { Icon } from './nodes';
import { useHoverIntent } from '../utils/useHoverIntent';

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
  onPointerOver?: (node: InternalGraphNode) => void;

  /**
   * The function to call when the pointer is out of the node.
   */
  onPointerOut?: (node: InternalGraphNode) => void;

  /**
   * The function to call when the node is clicked.
   */
  onClick?: (node: InternalGraphNode, props?: CollapseProps) => void;

  /**
   * The function to call when the node is double clicked.
   */
  onDoubleClick?: (node: InternalGraphNode) => void;

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
  draggable,
  labelFontUrl,
  contextMenu,
  onClick,
  onDoubleClick,
  onPointerOver,
  onDragged,
  onPointerOut,
  onContextMenu,
  renderNode
}) => {
  const cameraControls = useCameraControls();
  const theme = useStore(state => state.theme);
  const node = useStore(state => state.nodes.find(n => n.id === id));
  const edges = useStore(state => state.edges);
  const draggingId = useStore(state => state.draggingId);
  const collapsedNodeIds = useStore(state => state.collapsedNodeIds);
  const setDraggingId = useStore(state => state.setDraggingId);
  const setNodePosition = useStore(state => state.setNodePosition);
  const setCollapsedNodeIds = useStore(state => state.setCollapsedNodeIds);
  const isCollapsed = useStore(state => state.collapsedNodeIds.includes(id));
  const isActive = useStore(state => state.actives?.includes(id));
  const isSelected = useStore(state => state.selections?.includes(id));
  const hasSelections = useStore(state => state.selections?.length > 0);

  const isDragging = draggingId === id;
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

  const selectionOpacity = hasSelections
    ? isSelected || active || isActive
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

  const [{ nodePosition, labelPosition, subLabelPosition }] = useSpring(
    () => ({
      from: {
        nodePosition: [0, 0, 0],
        labelPosition: [0, -(nodeSize + 7), 2],
        subLabelPosition: [0, -(nodeSize + 15), 2]
      },
      to: {
        nodePosition: position
          ? [position.x, position.y, position.z]
          : [0, 0, 0],
        labelPosition: [0, -(nodeSize + 7), 2],
        subLabelPosition: [0, -(nodeSize + 15), 2]
      },
      config: {
        ...animationConfig,
        duration: animated && !draggingId ? undefined : 0
      }
    }),
    [isDragging, position, animated, nodeSize]
  );

  const bind = useDrag({
    draggable,
    position,
    // @ts-ignore
    set: pos => setNodePosition(id, pos),
    onDragStart: () => {
      setDraggingId(id);
      setActive(true);
      cameraControls.controls.enabled = false;
    },
    onDragEnd: () => {
      setDraggingId(null);
      setActive(false);
      cameraControls.controls.enabled = true;
      onDragged?.(node);
    }
  });

  useCursor(active && !draggingId && onClick !== undefined, 'pointer');
  useCursor(
    active && draggable && !isDragging && onClick === undefined,
    'grab'
  );
  useCursor(isDragging, 'grabbing');

  const combinedActiveState = isSelected || active || isDragging || isActive;
  const color = combinedActiveState
    ? theme.node.activeFill
    : node.fill || theme.node.fill;

  const { pointerOver, pointerOut } = useHoverIntent({
    disabled: disabled || isDragging,
    onPointerOver: () => {
      setActive(true);
      onPointerOver?.(node);
    },
    onPointerOut: () => {
      setActive(false);
      onPointerOut?.(node);
    }
  });

  return (
    <a.group
      userData={{ id, type: 'node' }}
      ref={group}
      position={nodePosition as any}
      onPointerOver={pointerOver}
      onPointerOut={pointerOut}
      onClick={() => {
        if (!disabled && !isDragging) {
          onClick?.(node, {
            canCollapse,
            isCollapsed
          });
        }
      }}
      onDoubleClick={() => {
        if (!disabled && !isDragging) {
          onDoubleClick?.(node);
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
      {renderNode ? (
        renderNode({
          id,
          color,
          size: nodeSize,
          active: combinedActiveState,
          opacity: selectionOpacity,
          animated,
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
            />
          )}
        </>
      )}
      <Ring
        opacity={isSelected ? 0.5 : 0}
        size={nodeSize}
        animated={animated}
        color={isSelected || active ? theme.ring.activeFill : theme.ring.fill}
      />
      {menuVisible && contextMenu && (
        <Html prepend={true} center={true}>
          {contextMenu({
            data: node,
            canCollapse,
            isCollapsed,
            onCollapse,
            onClose: () => setMenuVisible(false)
          })}
        </Html>
      )}
      {(labelVisible || isSelected || active) && label && (
        <>
          <a.group position={labelPosition as any}>
            <Label
              text={label}
              fontUrl={labelFontUrl}
              opacity={selectionOpacity}
              stroke={theme.node.label.stroke}
              active={isSelected || active || isDragging || isActive}
              color={
                isSelected || active || isDragging || isActive
                  ? theme.node.label.activeColor
                  : theme.node.label.color
              }
            />
          </a.group>
          {subLabel && (
            <a.group position={subLabelPosition as any}>
              <Label
                text={subLabel}
                fontUrl={labelFontUrl}
                opacity={selectionOpacity}
                stroke={theme.node.label.stroke}
                active={isSelected || active || isDragging || isActive}
                color={
                  isSelected || active || isDragging || isActive
                    ? theme.node.label.activeColor
                    : theme.node.label.color
                }
              />
            </a.group>
          )}
        </>
      )}
    </a.group>
  );
};

Node.defaultProps = {
  draggable: false
};
