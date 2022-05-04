import React, { FC } from 'react';
import { useSpring, a } from '@react-spring/three';
import { animationConfig } from '../utils/animation';
import * as THREE from 'three';

export interface SphereProps {
  size?: number;
  color?: string;
  opacity?: number;
  animated?: boolean;
  onActive?: (active: boolean) => void;
  onClick?: () => void;
  onContextMenu?: () => void;
}

export const Sphere: FC<SphereProps> = ({
  color,
  size,
  opacity,
  animated,
  onActive,
  onClick,
  onContextMenu
}) => {
  const { scale, nodeColor, nodeOpacity } = useSpring({
    from: {
      // Note: This prevents incorrect scaling w/ 0
      scale: [0.00001, 0.00001, 0.00001],
      nodeColor: color,
      nodeOpacity: 0
    },
    to: {
      scale: [size, size, size],
      nodeColor: color,
      nodeOpacity: opacity
    },
    config: {
      ...animationConfig,
      duration: animated ? undefined : 0
    }
  });

  return (
    <group>
      <a.mesh
        scale={scale as any}
        onClick={onClick}
        onPointerDown={event => {
          // context menu controls
          if (event.nativeEvent.buttons === 2) {
            onContextMenu();
          }
        }}
        onPointerOver={() => onActive?.(true)}
        onPointerOut={() => onActive?.(false)}
      >
        <sphereBufferGeometry attach="geometry" args={[1, 25, 25]} />
        <a.meshPhongMaterial
          attach="material"
          side={THREE.DoubleSide}
          transparent={true}
          fog={true}
          opacity={nodeOpacity}
          color={nodeColor}
        />
      </a.mesh>
    </group>
  );
};

Sphere.defaultProps = {
  opacity: 1,
  active: false,
  selected: false
};
