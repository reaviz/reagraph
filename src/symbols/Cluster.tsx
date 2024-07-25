import React, { FC, useMemo, useState } from 'react';
import { ClusterGroup, animationConfig, useHoverIntent } from '../utils';
import { useSpring, a } from '@react-spring/three';
import { Color, DoubleSide } from 'three';
import { useStore } from '../store';
import { Label } from './Label';
import { useCursor } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';

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
}

export const Cluster: FC<ClusterProps> = ({
  animated,
  position,
  padding,
  labelFontUrl,
  disabled,
  radius,
  nodes,
  label,
  onClick,
  onPointerOver,
  onPointerOut
}) => {
  const theme = useStore(state => state.theme);
  const rad = Math.max(position.width, position.height) / 2;
  const offset = rad - radius + padding;
  const [active, setActive] = useState<boolean>(false);
  const center = useStore(state => state.centerPosition);

  const isActive = useStore(state =>
    state.actives?.some(id => nodes.some(n => n.id === id))
  );

  const isSelected = useStore(state =>
    state.selections?.some(id => nodes.some(n => n.id === id))
  );

  const hasSelections = useStore(state => state.selections?.length > 0);

  const opacity = hasSelections
    ? isSelected || active || isActive
      ? theme.cluster?.selectedOpacity
      : theme.cluster?.inactiveOpacity
    : theme.cluster?.opacity;

  const { circleOpacity, circlePosition, labelPosition } = useSpring({
    from: {
      circlePosition: [center.x, center.y, -1],
      circleOpacity: 0,
      labelPosition: [0, -offset, 2]
    },
    to: {
      labelPosition: [0, -offset, 2],
      circlePosition: position ? [position.x, position.y, -1] : [0, 0, -1],
      circleOpacity: opacity
    },
    config: {
      ...animationConfig,
      duration: animated ? undefined : 0
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

  useCursor(active && onClick !== undefined, 'pointer');

  const { pointerOver, pointerOut } = useHoverIntent({
    disabled,
    onPointerOver: (event: ThreeEvent<PointerEvent>) => {
      setActive(true);
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
          position={circlePosition as any}
          onPointerOver={pointerOver}
          onPointerOut={pointerOut}
          onClick={(event: ThreeEvent<MouseEvent>) => {
            if (!disabled) {
              onClick?.(
                {
                  nodes,
                  label
                },
                event
              );
            }
          }}
        >
          <mesh>
            <ringGeometry attach="geometry" args={[offset, 0, 128]} />
            <a.meshBasicMaterial
              attach="material"
              color={normalizedFill}
              transparent={true}
              depthTest={false}
              opacity={theme.cluster?.fill ? circleOpacity : 0}
              side={DoubleSide}
              fog={true}
            />
          </mesh>
          <mesh>
            <ringGeometry
              attach="geometry"
              args={[offset, rad + padding, 128]}
            />
            <a.meshBasicMaterial
              attach="material"
              color={normalizedStroke}
              transparent={true}
              depthTest={false}
              opacity={circleOpacity}
              side={DoubleSide}
              fog={true}
            />
          </mesh>
          {theme.cluster?.label && (
            <a.group position={labelPosition as any}>
              <Label
                text={label}
                opacity={opacity}
                fontUrl={labelFontUrl}
                stroke={theme.cluster.label.stroke}
                active={false}
                color={theme.cluster?.label.color}
                fontSize={12}
              />
            </a.group>
          )}
        </a.group>
      ),
    [
      theme.cluster,
      circlePosition,
      pointerOver,
      pointerOut,
      offset,
      normalizedFill,
      circleOpacity,
      rad,
      padding,
      normalizedStroke,
      labelPosition,
      label,
      opacity,
      labelFontUrl,
      disabled,
      onClick,
      nodes
    ]
  );

  return cluster;
};

Cluster.defaultProps = {
  radius: 2,
  padding: 40
};
