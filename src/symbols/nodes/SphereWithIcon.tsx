import React, { FC } from 'react';
import { NodeRendererProps } from '../../types';
import { Sphere } from './Sphere';
import { Icon } from './Icon';

export interface SphereWithIconProps extends NodeRendererProps {
  /**
   * The image to display on the icon.
   */
  image: string;
}

export const SphereWithIcon: FC<SphereWithIconProps> = ({
  color,
  id,
  size,
  opacity = 1,
  node,
  active = false,
  animated,
  image,
  selected
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
    <Icon
      id={id}
      image={image}
      selected={selected}
      size={size + 8}
      opacity={opacity}
      animated={animated}
      color={color}
      node={node}
      active={active}
    />
  </>
);
