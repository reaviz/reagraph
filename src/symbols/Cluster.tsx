import React, { FC, useMemo } from 'react';
import { ClusterGroup, animationConfig } from '../utils';
import { useSpring, a } from '@react-spring/three';
import { Color, DoubleSide } from 'three';
import { useStore } from '../store';
import { Label } from './Label';

export interface ClusterProps extends ClusterGroup {
  /**
   * Whether the circle should be animated.
   */
  animated?: boolean;

  /**
   * The opacity of the circle.
   */
  opacity?: number;

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
}

export const Cluster: FC<ClusterProps> = ({
  animated,
  opacity,
  position,
  padding,
  labelFontUrl,
  radius,
  label
}) => {
  const theme = useStore(state => state.theme);
  const rad = Math.max(position.width, position.height) / 2;
  const offset = rad - radius + padding;

  const { circleOpacity, circlePosition, labelPosition } = useSpring({
    from: {
      circlePosition: [0, 0, -1],
      circleOpacity: 0,
      labelPosition: [0, 0, 2]
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

  const normalizedColor = useMemo(
    () => new Color(theme.cluster.stroke),
    [theme.cluster.stroke]
  );

  return (
    <>
      {theme.cluster && (
        <a.group position={circlePosition as any}>
          <mesh>
            <ringGeometry
              attach="geometry"
              args={[offset, rad + padding, 128]}
            />
            <a.meshBasicMaterial
              attach="material"
              color={normalizedColor}
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
                opacity={1}
                labelFontUrl={labelFontUrl}
                stroke={theme.cluster.label.stroke}
                active={false}
                color={theme.cluster.label.color}
                fontSize={12}
              />
            </a.group>
          )}
        </a.group>
      )}
    </>
  );
};

Cluster.defaultProps = {
  opacity: 1,
  radius: 2,
  padding: 40
};
