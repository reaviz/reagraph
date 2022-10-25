import React, { FC, useMemo } from 'react';
import { useSpring, a } from '@react-spring/three';
import { animationConfig } from '../../utils/animation';
import { Color, DoubleSide } from 'three';
import { NodeRendererProps } from '../../types';

export const Sphere: FC<NodeRendererProps> = ({
  color,
  id,
  size,
  opacity,
  animated
}) => {
  const { scale, nodeOpacity } = useSpring({
    from: {
      // Note: This prevents incorrect scaling w/ 0
      scale: [0.00001, 0.00001, 0.00001],
      nodeOpacity: 0
    },
    to: {
      scale: [size, size, size],
      nodeOpacity: opacity
    },
    config: {
      ...animationConfig,
      duration: animated ? undefined : 0
    }
  });
  const normalizedColor = useMemo(() => new Color(color), [color]);

  return (
    <a.mesh userData={{ id, type: 'node' }} scale={scale as any}>
      <sphereBufferGeometry attach="geometry" args={[1, 25, 25]} />
      <a.meshPhongMaterial
        attach="material"
        side={DoubleSide}
        transparent={true}
        fog={true}
        opacity={nodeOpacity}
        color={normalizedColor}
      />
    </a.mesh>
  );
};

Sphere.defaultProps = {
  opacity: 1,
  active: false,
  selected: false
};
