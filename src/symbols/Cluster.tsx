import React, { FC, useMemo, useState } from 'react';
import { ClusterGroup, animationConfig, useHoverIntent } from '../utils';
import { useSpring, a } from '@react-spring/three';
import { Color } from 'three';
import { useStore } from '../store';
import { Label } from './Label';
import { useCursor } from 'glodrei';
import { ThreeEvent } from '@react-three/fiber';
import { useDrag } from '../utils/useDrag';
import { Vector3 } from 'three';
import { useCameraControls } from '../CameraControls';
import { ClusterRenderer } from '../types';
import { Ring } from './clusters/Ring';

export type ClusterEventArgs = Omit<ClusterGroup, 'position'>;

export interface ClusterProps extends ClusterGroup {
  /**
   * Whether the circle should be animated.
   */
  animated?: boolean;

  /**
   * The radius of the circle. Default 1.
   */
  radius?: number;

  /**
   * The padding of the circle. Default 20.
   */
  padding?: number;

  /**
   * The url for the label font.
   */
  labelFontUrl?: string;

  /**
   * Whether the node is disabled.
   */
  disabled?: boolean;

  /**
   * When the cluster was clicked.
   */
  onClick?: (cluster: ClusterEventArgs, event: ThreeEvent<MouseEvent>) => void;

  /**
   * When a cluster receives a pointer over event.
   */
  onPointerOver?: (
    cluster: ClusterEventArgs,
    event: ThreeEvent<PointerEvent>
  ) => void;

  /**
   * When cluster receives a pointer leave event.
   */
  onPointerOut?: (
    cluster: ClusterEventArgs,
    event: ThreeEvent<PointerEvent>
  ) => void;

  /**
   * Whether the cluster is draggable
   */
  draggable?: boolean;

  /**
   * Triggered after a cluster was dragged
   */
  onDragged?: (cluster: ClusterEventArgs) => void;

  /**
   * Render a custom cluster label
   */
  onRender?: ClusterRenderer;
}

export const Cluster: FC<ClusterProps> = ({
  animated,
  position,
  padding = 40,
  labelFontUrl,
  disabled,
  radius = 2,
  nodes,
  label,
  onClick,
  onPointerOver,
  onPointerOut,
  draggable = false,
  onDragged,
  onRender
}) => {
  const theme = useStore(state => state.theme);
  const rad = Math.max(position.width, position.height) / 2;
  const offset = rad - radius + padding;
  const [active, setActive] = useState<boolean>(false);
  const center = useStore(state => state.centerPosition);
  const nodesState = useStore(state => state.nodes);
  const cameraControls = useCameraControls();
  const draggingIds = useStore(state => state.draggingIds);
  const isDraggingCurrent = draggingIds.includes(label);
  const isDragging = draggingIds.length > 0;

  const isActive = useStore(state =>
    state.actives?.some(id => nodes.some(n => n.id === id))
  );
  const hoveredNodeId = useStore(state => state.hoveredNodeId);

  const isSelected = useStore(state =>
    state.selections?.some(id => nodes.some(n => n.id === id))
  );

  const hasSelections = useStore(state => state.selections?.length > 0);

  const opacity = hasSelections
    ? isSelected || active || isActive
      ? theme.cluster?.selectedOpacity
      : theme.cluster?.inactiveOpacity
    : theme.cluster?.opacity;

  const labelPosition: [number, number, number] = useMemo(() => {
    const defaultPosition: [number, number, number] = [0, -offset, 2];
    const themeOffset = theme.cluster?.label?.offset;
    if (themeOffset) {
      return [
        defaultPosition[0] - themeOffset[0],
        defaultPosition[1] - themeOffset[1],
        defaultPosition[2] - themeOffset[2]
      ];
    }

    return defaultPosition;
  }, [offset, theme.cluster?.label?.offset]);

  const { circlePosition } = useSpring({
    from: {
      circlePosition: [center.x, center.y, -1] as [number, number, number]
    },
    to: {
      circlePosition: position
        ? ([position.x, position.y, -1] as [number, number, number])
        : ([0, 0, -1] as [number, number, number])
    },
    config: {
      ...animationConfig,
      duration: animated && !isDragging ? undefined : 0
    }
  });

  const normalizedStroke = useMemo(
    () => new Color(theme.cluster?.stroke),
    [theme.cluster?.stroke]
  );

  const normalizedFill = useMemo(
    () => new Color(theme.cluster?.fill),
    [theme.cluster?.fill]
  );

  const addDraggingId = useStore(state => state.addDraggingId);
  const removeDraggingId = useStore(state => state.removeDraggingId);
  const setClusterPosition = useStore(state => state.setClusterPosition);

  // Define the drag event handlers for the cluster
  const bind = useDrag({
    draggable: draggable && !hoveredNodeId,
    position: {
      x: position.x,
      y: position.y,
      z: -1
    } as any,
    set: (pos: Vector3) => setClusterPosition(label, pos as any),
    onDragStart: () => {
      addDraggingId(label);
      setActive(true);
    },
    onDragEnd: () => {
      removeDraggingId(label);
      setActive(false);
      // Get nodes from store with updated position after dragging
      const updatedClusterNodes = nodesState.filter(n => n.cluster === label);
      onDragged?.({ nodes: updatedClusterNodes, label });
    }
  });

  // Set the cursor to pointer when the cluster is active and not dragging
  useCursor(active && !isDragging && onClick !== undefined, 'pointer');
  // Set the cursor to grab when the cluster is active and draggable
  useCursor(
    active && draggable && !isDraggingCurrent && onClick === undefined,
    'grab'
  );
  // Set the cursor to grabbing when the cluster is dragging
  useCursor(isDraggingCurrent, 'grabbing');

  const { pointerOver, pointerOut } = useHoverIntent({
    disabled,
    onPointerOver: (event: ThreeEvent<PointerEvent>) => {
      setActive(true);
      cameraControls.freeze();
      onPointerOver?.(
        {
          nodes,
          label
        },
        event
      );
    },
    onPointerOut: (event: ThreeEvent<PointerEvent>) => {
      setActive(false);
      cameraControls.unFreeze();
      onPointerOut?.(
        {
          nodes,
          label
        },
        event
      );
    }
  });

  const cluster = useMemo(
    () =>
      theme.cluster && (
        <a.group
          userData={{ id: label, type: 'cluster' }}
          position={circlePosition as any}
          onPointerOver={pointerOver}
          onPointerOut={pointerOut}
          onClick={(event: ThreeEvent<MouseEvent>) => {
            if (!disabled && !isDraggingCurrent) {
              onClick?.({ nodes, label }, event);
            }
          }}
          {...(bind() as any)}
        >
          {onRender ? (
            onRender({
              label: {
                position: labelPosition,
                text: label,
                opacity: opacity,
                fontUrl: labelFontUrl
              },
              opacity,
              outerRadius: offset,
              innerRadius: rad,
              padding,
              theme
            })
          ) : (
            <>
              <Ring
                outerRadius={offset}
                innerRadius={rad}
                padding={padding}
                normalizedFill={normalizedFill}
                normalizedStroke={normalizedStroke}
                opacity={opacity}
                animated={animated}
                theme={theme}
              />
              {theme.cluster?.label && (
                <a.group position={labelPosition}>
                  <Label
                    text={label}
                    opacity={opacity}
                    fontUrl={labelFontUrl}
                    stroke={theme.cluster.label.stroke}
                    active={false}
                    color={theme.cluster?.label.color}
                    fontSize={theme.cluster?.label.fontSize ?? 12}
                  />
                </a.group>
              )}
            </>
          )}
        </a.group>
      ),
    [
      theme,
      circlePosition,
      pointerOver,
      pointerOut,
      offset,
      normalizedFill,
      rad,
      padding,
      normalizedStroke,
      labelPosition,
      label,
      opacity,
      labelFontUrl,
      disabled,
      onClick,
      nodes,
      bind,
      isDraggingCurrent,
      onRender,
      animated
    ]
  );

  return cluster;
};
