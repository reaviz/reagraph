import React, { FC, useMemo } from 'react';
import { a, useSpring } from '@react-spring/three';
import { TextureLoader, LinearFilter } from 'three';
import { animationConfig } from '../utils';
import { ThreeEvent } from '@react-three/fiber';

export interface IconProps {
  image: string;
  opacity?: number;
  id: string;
  animated?: boolean;
  size?: number;
  onActive?: (state: boolean) => void;
  onClick?: () => void;
  onContextMenu?: () => void;
  onPointerDown?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerUp?: (event: ThreeEvent<PointerEvent>) => void;
}

export const Icon: FC<IconProps> = ({
  image,
  id,
  size,
  opacity,
  animated,
  onActive,
  onClick,
  onContextMenu,
  onPointerDown,
  onPointerUp
}) => {
  const texture = useMemo(() => new TextureLoader().load(image), [image]);

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
        userData={{ id }}
        scale={scale as any}
        onClick={onClick}
        onPointerDown={event => {
          // context menu controls
          if (event.nativeEvent.buttons === 2) {
            onContextMenu();
          }

          onPointerDown?.(event);
        }}
        onPointerUp={onPointerUp}
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
          <primitive attach="map" object={texture} minFilter={LinearFilter} />
        </a.spriteMaterial>
      </a.sprite>
    </group>
  );
};

Icon.defaultProps = {
  opacity: 1
};
