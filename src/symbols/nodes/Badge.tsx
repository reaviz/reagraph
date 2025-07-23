import React, { FC, useMemo } from 'react';
import { a, useSpring } from '@react-spring/three';
import { Billboard, RoundedBox, Text } from '@react-three/drei';
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
  size,
  opacity = 1,
  animated,
  backgroundColor = '#ffffff',
  textColor = '#000000',
  badgeSize = 1.5,
  position = [size * 0.65, size * 0.65, 0.1]
}) => {
  const normalizedBgColor = useMemo(
    () => new Color(backgroundColor),
    [backgroundColor]
  );
  const normalizedTextColor = useMemo(() => new Color(textColor), [textColor]);

  // Calculate dynamic badge dimensions based on text length
  const badgeDimensions = useMemo(() => {
    const baseWidth = 0.5;
    const baseHeight = 0.5;
    const minWidth = baseWidth;
    const minHeight = baseHeight;
    const padding = 0.3; // Increased padding

    // Estimate text width based on character count
    const charCount = label.length;
    const estimatedWidth = Math.max(
      minWidth,
      Math.min(charCount * 0.15 + padding, 2.0 + padding)
    ); // Add padding to width
    const estimatedHeight = Math.max(
      minHeight,
      Math.min(charCount * 0.05 + padding * 0.5, 0.8 + padding * 0.5)
    ); // Add padding to height

    return {
      width: estimatedWidth,
      height: estimatedHeight
    };
  }, [label]);

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
      <a.group scale={scale as any} renderOrder={2}>
        <a.mesh position={[0, 0, 1]}>
          <RoundedBox
            args={[badgeDimensions.width, badgeDimensions.height, 0.01]} // dynamic width, height, depth
            radius={0.12} // corner radius
            smoothness={8}
            material-color={backgroundColor}
            material-transparent={true}
          />
        </a.mesh>
        <Text
          position={[0, 0, 1.1]}
          fontSize={0.3}
          color={normalizedTextColor}
          anchorX="center"
          anchorY="middle"
          maxWidth={badgeDimensions.width - 0.2}
          textAlign="center"
          material-depthTest={false}
          material-depthWrite={false}
        >
          {label}
        </Text>
      </a.group>
    </Billboard>
  );
};
