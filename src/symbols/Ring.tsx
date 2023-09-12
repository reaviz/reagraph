import React, { FC, useMemo } from 'react';
import { Color, ColorRepresentation, DoubleSide } from 'three';
import { animationConfig } from '../utils/animation';
import { useSpring, a } from '@react-spring/three';
import { Billboard } from '@react-three/drei';

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
   * The defaultGeometry ring size which is taken fron Theme.
   */
  defaultGeometry?: [number, number, number];
}

export const Ring: FC<RingProps> = ({
  color,
  size,
  opacity,
  animated,
  defaultGeometry
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

  return (
    <Billboard position={[0, 0, 1]}>
      <a.mesh scale={ringSize as any}>
        <ringGeometry attach="geometry" args={defaultGeometry} />
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

Ring.defaultProps = {
  color: '#D8E6EA',
  size: 1,
  opacity: 0.5,
  defaultGeometry: [4, 4.5, 25]
};
