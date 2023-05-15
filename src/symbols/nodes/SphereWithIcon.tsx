import React, { FC, useMemo, useRef } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import { useSpring, a } from '@react-spring/three';
import { animationConfig } from '../../utils/animation';
import { Color, DoubleSide, Group, TextureLoader } from 'three';
import { NodeRendererProps } from '../../types';

export interface SphereWithIconProps extends NodeRendererProps {
  image: string;
}

export const SphereWithIcon: FC<SphereWithIconProps> = ({
  color,
  id,
  size,
  opacity,
  animated,
  image
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
  const iconTexture = useLoader(TextureLoader, image);
  const meshRef = useRef<Group>();
  const camera = useThree(state => state.camera);

  useFrame(() => {
    meshRef.current.lookAt(camera.position);
  });

  return (
    <a.group ref={meshRef}>
      <a.mesh userData={{ id }} scale={scale as any}>
        <sphereBufferGeometry
          attach="geometry"
          args={[1, 25, 25, Math.PI, Math.PI]}
        />
        <a.meshPhongMaterial
          attach="material"
          side={DoubleSide}
          transparent={true}
          fog={true}
          opacity={nodeOpacity}
          color={normalizedColor}
        />
      </a.mesh>
      <a.mesh>
        <planeBufferGeometry attach="geometry" args={[10, 10]} />
        <a.meshBasicMaterial
          attach="material"
          map={iconTexture}
          opacity={nodeOpacity}
          transparent
        />
      </a.mesh>
    </a.group>
  );
};

SphereWithIcon.defaultProps = {
  opacity: 1,
  active: false,
  selected: false
};
