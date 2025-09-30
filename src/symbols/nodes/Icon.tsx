import { a, useSpring } from '@react-spring/three';
import type { FC } from 'react';
import React, { useMemo } from 'react';
import { DoubleSide, LinearFilter, TextureLoader } from 'three';

import type { NodeRendererProps } from '../../types';
import { animationConfig } from '../../utils';

export interface IconProps extends NodeRendererProps {
  /**
   * The image to display on the icon.
   */
  image: string;
}

export const Icon: FC<IconProps> = ({
  image,
  id,
  size,
  opacity = 1,
  animated
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
    <a.sprite userData={{ id, type: 'node' }} scale={scale as any}>
      <a.spriteMaterial
        attach="material"
        opacity={spriteOpacity}
        fog={true}
        depthTest={false}
        transparent={true}
        side={DoubleSide}
      >
        <primitive attach="map" object={texture} minFilter={LinearFilter} />
      </a.spriteMaterial>
    </a.sprite>
  );
};
