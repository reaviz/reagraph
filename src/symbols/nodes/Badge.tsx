import React, { FC, useMemo } from 'react';
import { a, useSpring } from '@react-spring/three';
import { Billboard, Text } from '@react-three/drei';
import { animationConfig } from '../../utils';
import { NodeRendererProps } from '../../types';
import { Color, DoubleSide } from 'three';

export interface BadgeProps extends NodeRendererProps {
  /**
   * The text to display in the badge.
   */
  label: string;

  /**
   * Background color of the badge.
   */
  backgroundColor?: string;

  /**
   * Text color of the badge.
   */
  textColor?: string;

  /**
   * Size multiplier for the badge relative to the node size.
   */
  badgeSize?: number;

  /**
   * Position offset from the node center.
   */
  position?: [number, number, number];
}

export const Badge: FC<BadgeProps> = ({
  label,
  id,
  size,
  opacity = 1,
  animated,
  backgroundColor = '#ffffff',
  textColor = '#000000',
  badgeSize = 2,
  position = [size * 0.65, size * 0.65, 0.1]
}) => {
  const normalizedBgColor = useMemo(
    () => new Color(backgroundColor),
    [backgroundColor]
  );
  const normalizedTextColor = useMemo(() => new Color(textColor), [textColor]);

  const { scale, badgeOpacity } = useSpring({
    from: {
      scale: [0.00001, 0.00001, 0.00001],
      badgeOpacity: 0
    },
    to: {
      scale: [size * badgeSize, size * badgeSize, size * badgeSize],
      badgeOpacity: opacity
    },
    config: {
      ...animationConfig,
      duration: animated ? undefined : 0
    }
  });

  return (
    <Billboard position={position}>
      <a.group scale={scale as any}>
        <a.mesh>
          <planeGeometry attach="geometry" args={[0.5, 0.5]} />
          <a.meshBasicMaterial
            attach="material"
            color={normalizedBgColor}
            transparent={true}
            opacity={badgeOpacity}
            side={DoubleSide}
            depthTest={false}
          />
        </a.mesh>
        <Text
          position={[0, 0, 1]}
          fontSize={0.3}
          color={normalizedTextColor}
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </a.group>
    </Billboard>
  );
};
