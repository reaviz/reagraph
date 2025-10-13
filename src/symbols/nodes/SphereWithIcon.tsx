import type { FC } from 'react';
import React from 'react';

import type { NodeRendererProps } from '../../types';
import { Icon } from './Icon';
import { Sphere } from './Sphere';

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
