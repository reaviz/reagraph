import React, { FC, useMemo, useRef } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import { useSpring, a } from '@react-spring/three';
import { animationConfig } from '../utils/animation';
import {
  Color,
  ColorRepresentation,
  DoubleSide,
  Group,
  TextureLoader
} from 'three';

export interface SphereProps {
  size?: number;
  color?: ColorRepresentation;
  opacity?: number;
  id: string;
  animated?: boolean;
  onClick?: () => void;
  onContextMenu?: () => void;
}

export const Sphere: FC<SphereProps> = ({
  color,
  id,
  size,
  opacity,
  animated,
  onClick,
  onContextMenu
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
  const iconTexture = useLoader(
    TextureLoader,
    'http://placekitten.com/200/200'
  );
  const meshRef = useRef<Group>();
  const { camera } = useThree();
  useFrame(() => {
    meshRef.current.lookAt(camera.position);
  });

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
