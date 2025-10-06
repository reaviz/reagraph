import type { FC } from 'react';
import React from 'react';
import type { ColorRepresentation } from 'three';

import { Sphere } from './Sphere';
import type { SvgProps } from './Svg';
import { Svg } from './Svg';

export interface SphereWithSvgProps extends SvgProps {
  /**
   * The image to display on the icon.
   */
  image: string;

  /**
   * The color of the svg fill.
   */
  svgFill?: ColorRepresentation;
}

export const SphereWithSvg: FC<SphereWithSvgProps> = ({
  color,
  id,
  size,
  opacity = 1,
  node,
  svgFill,
  active = false,
  animated,
  image,
  selected,
  ...rest
}) => (
  <>
    <Sphere
      id={id}
      selected={selected}
      size={size}
      opacity={opacity}
      animated={animated}
      color={color}
      node={node}
      active={active}
    />
    <Svg
      {...rest}
      id={id}
      selected={selected}
      image={image}
      size={size}
      opacity={opacity}
      animated={animated}
      color={svgFill}
      node={node}
      active={active}
    />
  </>
);
