import React, { FC, useMemo } from 'react';
import { a, useSpring } from '@react-spring/three';
import { animationConfig } from '../../utils';
import { NodeRendererProps } from '../../types';
import { Billboard, Svg as DreiSvg, SvgProps as DreiSvgProps } from 'glodrei';
import { Color, DoubleSide } from 'three';

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
