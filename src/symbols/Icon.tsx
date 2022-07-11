import React, { FC, useMemo } from 'react';
import { a, useSpring } from '@react-spring/three';
import { TextureLoader, LinearFilter } from 'three';
import { animationConfig } from '../utils';

export interface IconProps {
  image: string;
  opacity?: number;
  id: string;
  animated?: boolean;
  size?: number;
  onActive?: (state: boolean) => void;
  onClick?: () => void;
  onContextMenu?: () => void;
}

export const Icon: FC<IconProps> = ({
  image,
  id,
  size,
  opacity,
  animated,
  onActive,
  onClick,
  onContextMenu
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
    <a.sprite
      userData={{ id }}
      scale={scale as any}
      onClick={onClick}
      onPointerDown={event => {
        // context menu controls
        if (event.nativeEvent.buttons === 2) {
          event.stopPropagation();
          onContextMenu();
        }
      }}
      onPointerOver={() => onActive(true)}
      onPointerOut={() => onActive(false)}
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
  );
};

Icon.defaultProps = {
  opacity: 1
};
