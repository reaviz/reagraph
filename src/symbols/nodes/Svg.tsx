import { a, useSpring } from '@react-spring/three';
import type { SvgProps as DreiSvgProps } from '@react-three/drei';
import { Billboard, Svg as DreiSvg } from '@react-three/drei';
import type { FC } from 'react';
import React, { useMemo } from 'react';
import { Color, DoubleSide } from 'three';

import type { NodeRendererProps } from '../../types';
import { animationConfig } from '../../utils';

export type SvgProps = NodeRendererProps &
  Omit<DreiSvgProps, 'src' | 'id'> & {
    /**
     * The image to display on the icon.
     */
    image: string;
  };

export const Svg: FC<SvgProps> = ({
  id,
  image,
  color,
  size,
  opacity = 1,
  animated,
  ...rest
}) => {
  const normalizedSize = size / 25;

  const { scale } = useSpring({
    from: {
      scale: [0.00001, 0.00001, 0.00001]
    },
    to: {
      scale: [normalizedSize, normalizedSize, normalizedSize]
    },
    config: {
      ...animationConfig,
      duration: animated ? undefined : 0
    }
  });

  const normalizedColor = useMemo(() => new Color(color), [color]);

  return (
    <a.group userData={{ id, type: 'node' }} scale={scale as any}>
      <Billboard position={[0, 0, 1]}>
        <DreiSvg
          {...rest}
          src={image}
          fillMaterial={{
            fog: true,
            depthTest: false,
            transparent: true,
            color: normalizedColor,
            opacity,
            side: DoubleSide,
            ...(rest.fillMaterial || {})
          }}
          fillMeshProps={{
            // Note: This is a hack to get the svg to
            // render in the correct position.
            position: [-25, -25, 1],
            ...(rest.fillMeshProps || {})
          }}
        />
      </Billboard>
    </a.group>
  );
};
