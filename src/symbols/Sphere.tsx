import React, { FC, useMemo } from 'react';
import { useSpring, a } from '@react-spring/three';
import { animationConfig } from '../utils/animation';
import { Color, ColorRepresentation, DoubleSide } from 'three';

export interface SphereProps {
  size?: number;
  color?: ColorRepresentation;
  opacity?: number;
  id: string;
  animated?: boolean;
  onActive?: (active: boolean) => void;
  onClick?: () => void;
  onContextMenu?: () => void;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
}

export const Sphere: FC<SphereProps> = ({
  color,
  id,
  size,
  opacity,
  animated,
  onActive,
  onClick,
  onContextMenu,
  onPointerOver,
  onPointerOut
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
    <a.mesh
      userData={{ id, type: 'node' }}
      scale={scale as any}
      onClick={onClick}
      onPointerDown={event => {
        // context menu controls
        if (event.nativeEvent.buttons === 2) {
          event.stopPropagation();
          onContextMenu?.();
        }
      }}
      onPointerOver={() => {
        onActive?.(true);
        onPointerOver?.();
      }}
      onPointerOut={() => {
        onActive?.(false);
        onPointerOut?.();
      }}
    >
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
