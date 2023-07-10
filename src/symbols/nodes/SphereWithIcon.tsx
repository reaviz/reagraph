import React, { FC, useMemo, useRef } from 'react';
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
  opacity,
  node,
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
    <Icon
      id={id}
      image={image}
      size={size + 8}
      opacity={opacity}
      animated={animated}
      color={color}
      node={node}
      active={active}
    />
  </>
);

SphereWithIcon.defaultProps = {
  opacity: 1,
  active: false,
  selected: false
};
