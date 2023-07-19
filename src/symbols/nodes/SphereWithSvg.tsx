import React, { FC } from 'react';
import { Sphere } from './Sphere';
import { Svg, SvgProps } from './Svg';
import { ColorRepresentation } from 'three';

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
  opacity,
  node,
  svgFill,
  active,
  animated,
  image
}) => (
  <>
    <Sphere
      id={id}
      size={size}
      opacity={opacity}
      animated={animated}
      color={color}
      node={node}
      active={active}
    />
    <Svg
      id={id}
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

SphereWithSvg.defaultProps = {
  opacity: 1,
  active: false,
  selected: false
};
