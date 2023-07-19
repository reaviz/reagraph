import React, { FC } from 'react';
import { ClusterGroup, animationConfig } from '../utils';
import { useSpring, a } from '@react-spring/three';
import { DoubleSide } from 'three';
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

  const { circleOpacity, circlePosition, circleScale, labelPosition } =
    useSpring({
      from: {
        circlePosition: [0, 0, -1],
        circleOpacity: 0,
        circleScale: [0.00001, 0.00001, 0.00001],
        labelPosition: [0, 0, 2]
      },
      to: {
        labelPosition: [0, -offset, 2],
        circlePosition: position ? [position.x, position.y, -1] : [0, 0, -1],
        circleOpacity: opacity,
        circleScale: [1, 1, 1]
      },
      config: {
        ...animationConfig,
        duration: animated ? undefined : 0
      }
    });

  return (
    <>
      {theme.cluster && (
        <a.group position={circlePosition as any}>
          <a.mesh scale={circleScale as any}>
            <ringGeometry
              attach="geometry"
              args={[offset, rad + padding, 32]}
            />
            <a.meshBasicMaterial
              attach="material"
              color={theme.cluster.stroke}
              transparent={true}
              depthTest={false}
              opacity={circleOpacity}
              side={DoubleSide}
              fog={true}
            />
          </a.mesh>
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
