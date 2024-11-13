import React, { FC, useMemo } from 'react';
import { Color, ColorRepresentation, DoubleSide } from 'three';
import { animationConfig } from '../utils/animation';
import { useSpring, a } from '@react-spring/three';
import { Billboard } from 'glodrei';

export interface RingProps {
  /**
   * The color of the ring.
   */
  color?: ColorRepresentation;

  /**
   * Whether the ring should be animated.
   */
  animated?: boolean;

  /**
   * The size of the ring.
   */
  size?: number;

  /**
   * The opacity of the ring.
   */
  opacity?: number;

  /**
   * The stroke width of the ring.
   */
  strokeWidth?: number;

  /**
   * The inner radius of the ring.
   * Default value: 4
   */
  innerRadius?: number;

  /**
   * The number of segments in the ring geometry.
   * Default value: 25
   */
  segments?: number;
}

export const Ring: FC<RingProps> = ({
  color = '#D8E6EA',
  size = 1,
  opacity = 0.5,
  animated,
  strokeWidth = 5,
  innerRadius = 4,
  segments = 25
}) => {
  const normalizedColor = useMemo(() => new Color(color), [color]);

  const { ringSize, ringOpacity } = useSpring({
    from: {
      ringOpacity: 0,
      ringSize: [0.00001, 0.00001, 0.00001]
    },
    to: {
      ringOpacity: opacity,
      ringSize: [size / 2, size / 2, 1]
    },
    config: {
      ...animationConfig,
      duration: animated ? undefined : 0
    }
  });

  const strokeWidthFraction = strokeWidth / 10;
  const outerRadius = innerRadius + strokeWidthFraction;

  return (
    <Billboard position={[0, 0, 1]}>
      <a.mesh scale={ringSize as any}>
        <ringGeometry
          attach="geometry"
          args={[innerRadius, outerRadius, segments]}
        />
        <a.meshBasicMaterial
          attach="material"
          color={normalizedColor}
          transparent={true}
          depthTest={false}
          opacity={ringOpacity}
          side={DoubleSide}
          fog={true}
        />
      </a.mesh>
    </Billboard>
  );
};
