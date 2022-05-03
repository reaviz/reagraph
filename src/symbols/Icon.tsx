import React, { FC, useMemo } from 'react';
import { a, useSpring } from '@react-spring/three';
import * as THREE from 'three';
import { animationConfig } from '../utils';

export interface IconProps {
  image: string;
  opacity?: number;
  animated?: boolean;
  size?: number;
  onActive?: (state: boolean) => void;
  onClick?: () => void;
  onContextMenu?: () => void;
}

export const Icon: FC<IconProps> = ({
  image,
  size,
  opacity,
  animated,
  onActive,
  onClick,
  onContextMenu
}) => {
  const texture = useMemo(() => new THREE.TextureLoader().load(image), [image]);

  const { scale, spriteOpacity } = useSpring({
    from: {
      scale: [0.00001, 0.00001, 0.00001],
      spriteOpacity: 0
    },
    to: {
      scale: [size, size, size],
      spriteOpacity: opacity
    },
    config: {
      ...animationConfig,
      duration: animated ? undefined : 0
    }
  });

  return (
    <group>
      <a.sprite
        scale={scale as any}
        onClick={onClick}
        onPointerDown={event => {
          // context menu controls
          if (event.nativeEvent.buttons === 2) {
            onContextMenu();
          }
        }}
        onPointerOver={() => {
          onActive(true);
          document.body.style['cursor'] = 'pointer';
        }}
        onPointerOut={() => {
          onActive(false);
          document.body.style['cursor'] = 'inherit';
        }}
      >
        <a.spriteMaterial
          attach="material"
          opacity={spriteOpacity}
          fog={true}
          depthTest={false}
          transparent={true}
        >
          <primitive
            attach="map"
            object={texture}
            minFilter={THREE.LinearFilter}
          />
        </a.spriteMaterial>
      </a.sprite>
    </group>
  );
};

Icon.defaultProps = {
  opacity: 1
};
