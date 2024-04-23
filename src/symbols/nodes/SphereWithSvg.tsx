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

SphereWithSvg.defaultProps = {
  opacity: 1,
  active: false
};
