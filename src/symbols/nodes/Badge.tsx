import React, { FC, useMemo } from 'react';
import { a, useSpring } from '@react-spring/three';
import { Billboard, RoundedBox, Text } from '@react-three/drei';
import { animationConfig } from '../../utils';
import { NodeRendererProps } from '../../types';
import { Color } from 'three';

export type BadgePosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'center'
  | 'custom';

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
   * Stroke color of the badge border.
   */
  strokeColor?: string;

  /**
   * Size of the badge border stroke.
   */
  strokeWidth?: number;

  /**
   * Corner radius of the badge.
   */
  radius?: number;

  /**
   * Size multiplier for the badge relative to the node size.
   */
  badgeSize?: number;

  /**
   * Position offset from the node center or preset position.
   */
  position?: [number, number, number] | BadgePosition;

  /**
   * Padding around the badge text.
   */
  padding?: number;
}

export const Badge: FC<BadgeProps> = ({
  label,
  size,
  opacity = 1,
  animated,
  backgroundColor = '#ffffff',
  textColor = '#000000',
  strokeColor,
  strokeWidth = 0,
  radius = 0.12,
  badgeSize = 1.5,
  position = 'top-right',
  padding = 0.3
}) => {
  const normalizedBgColor = useMemo(
    () => new Color(backgroundColor),
    [backgroundColor]
  );
  const normalizedTextColor = useMemo(() => new Color(textColor), [textColor]);
  const normalizedStrokeColor = useMemo(
    () => (strokeColor ? new Color(strokeColor) : null),
    [strokeColor]
  );
  // Guard for radius
  const normalizedRadius = Math.min(radius, 0.2);

  // Calculate position based on preset or custom coordinates
  const badgePosition = useMemo((): [number, number, number] => {
    if (Array.isArray(position)) {
      return position;
    }

    const offset = size * 0.65;
    switch (position) {
    case 'top-right':
      return [offset, offset, 11];
    case 'top-left':
      return [-offset, offset, 11];
    case 'bottom-right':
      return [offset, -offset, 11];
    case 'bottom-left':
      return [-offset, -offset, 11];
    case 'center':
      return [0, 0, 11];
    default:
      return [offset, offset, 11];
    }
  }, [position, size]);

  // Calculate dynamic badge dimensions based on text length
  const badgeDimensions = useMemo(() => {
    const baseWidth = 0.5;
    const baseHeight = 0.5;
    const minWidth = baseWidth;
    const minHeight = baseHeight;

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
  }, [label, padding]);

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
    <Billboard position={badgePosition}>
      <a.group scale={scale as any} renderOrder={2}>
        {/* Stroke layer */}
        {strokeWidth > 0 && normalizedStrokeColor && (
          <a.mesh position={[0, 0, 0.9]}>
            <RoundedBox
              args={[
                badgeDimensions.width + strokeWidth,
                badgeDimensions.height + strokeWidth,
                0.01
              ]}
              radius={normalizedRadius}
              smoothness={8}
              material-color={normalizedStrokeColor}
              material-transparent={true}
            />
          </a.mesh>
        )}
        {/* Main background layer */}
        <a.mesh position={[0, 0, 1]}>
          <RoundedBox
            args={[badgeDimensions.width, badgeDimensions.height, 0.01]} // dynamic width, height, depth
            radius={normalizedRadius} // corner radius
            smoothness={8}
            material-color={normalizedBgColor}
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
