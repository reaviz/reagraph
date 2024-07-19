import React, { FC, useMemo } from 'react';
import { useSpring, a } from '@react-spring/three';
import { animationConfig } from '../../utils/animation';
import { Color, DoubleSide } from 'three';
import { NodeRendererProps } from '../../types';
import { Ring } from '../Ring';
import { useStore } from '../../store';

export const Sphere: FC<NodeRendererProps> = ({
  color,
  id,
  size,
  active,
  selected,
  opacity,
  animated,
  showRing = true
}) => {
  const { scale, nodeOpacity } = useSpring({
    from: {
      // Note: This prevents incorrect scaling w/ 0
      scale: [0.00001, 0.00001, 0.00001],
      nodeOpacity: 0
    },
    to: {
      scale: active
        ? [size * 1.05, size * 1.05, size * 1.05]
        : [size, size, size],
      nodeOpacity: opacity
    },
    config: {
      ...animationConfig,
      duration: animated ? undefined : 0
    }
  });

  const normalizedColor = useMemo(() => new Color(color), [color]);
  const theme = useStore(state => state.theme);

  return (
    <>
      <a.mesh userData={{ id, type: 'node' }} scale={scale as any}>
        <sphereGeometry attach="geometry" args={[1, 25, 25]} />
        <a.meshPhongMaterial
          attach="material"
          side={DoubleSide}
          transparent={true}
          fog={true}
          opacity={nodeOpacity}
          color={normalizedColor}
        />
      </a.mesh>
      {showRing && (
        <a.mesh position={[0, 0, 12]}>
          <Ring
            opacity={selected ? 0.5 : 0}
            size={size / 1.5}
            animated={animated}
            color={selected ? theme.ring.activeFill : theme.ring.fill}
            strokeWidth={3}
          />
        </a.mesh>
      )}
    </>
  );
};

Sphere.defaultProps = {
  opacity: 1,
  active: false
};
