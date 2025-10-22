import { a, useSpring } from '@react-spring/three';
import { Billboard, Image, RoundedBox, Text } from '@react-three/drei';
import type { FC } from 'react';
import React, { useMemo } from 'react';
import { Color } from 'three';

import type { NodeRendererProps } from '../../types';
import { animationConfig } from '../../utils';

// Layout constants
const CHAR_WIDTH_ESTIMATE = 0.15;
const ICON_TEXT_GAP = 0.15;

export type BadgePosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'center';

export type IconPosition = 'start' | 'end';

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

  /**
   * SVG icon path or URL to display in the badge.
   */
  icon?: string;

  /**
   * Size of the icon in the badge.
   */
  iconSize?: number;

  /**
   * Position of the icon relative to the text or custom coordinates [x, y].
   * - 'start': Icon appears before the text (left side)
   * - 'end': Icon appears after the text (right side)
   * - [x, y]: Custom coordinates within the badge. When using custom coordinates,
   *   the text remains centered and only the icon moves to the specified position.
   */
  iconPosition?: IconPosition | [number, number];
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
  padding = 0.3,
  icon,
  iconSize = 0.35,
  iconPosition = 'start'
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

  // Calculate dynamic badge dimensions based on text length and icon
  const badgeDimensions = useMemo(() => {
    const baseWidth = 0.5;
    const baseHeight = 0.5;
    const minWidth = baseWidth;
    const minHeight = baseHeight;

    // Estimate text width based on character count
    const charCount = label.length;
    let estimatedWidth = Math.max(
      minWidth,
      Math.min(charCount * CHAR_WIDTH_ESTIMATE + padding, 2.0 + padding)
    ); // Add padding to width

    // Add icon width if icon is present
    if (icon) {
      estimatedWidth += iconSize;
    }

    const estimatedHeight = Math.max(
      minHeight,
      Math.min(charCount * 0.05 + padding * 0.5, 0.8 + padding * 0.5)
    ); // Add padding to height

    return {
      width: estimatedWidth,
      height: estimatedHeight
    };
  }, [label, padding, icon, iconSize]);

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

  // Calculate content layout positions for icon and text
  const contentLayout = useMemo(() => {
    if (!icon) {
      return {
        textX: 0,
        textY: 0,
        iconX: 0,
        iconY: 0
      };
    }

    // If custom position is provided as an array
    if (Array.isArray(iconPosition)) {
      return {
        iconX: iconPosition[0],
        iconY: iconPosition[1],
        textX: 0,
        textY: 0
      };
    }

    const estimatedTextWidth = label.length * CHAR_WIDTH_ESTIMATE;
    const totalContentWidth = iconSize + estimatedTextWidth;
    const startX = -totalContentWidth / 2;

    if (iconPosition === 'start') {
      return {
        iconX: startX + iconSize - 0.5 / 2,
        iconY: 0,
        textX: startX + iconSize + estimatedTextWidth / 2,
        textY: 0
      };
    } else {
      return {
        textX: startX + estimatedTextWidth / 2,
        textY: 0,
        iconX: startX + estimatedTextWidth + ICON_TEXT_GAP + iconSize / 2,
        iconY: 0
      };
    }
  }, [icon, iconSize, iconPosition, label.length]);

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
        {/* Icon */}
        {icon && (
          <Image
            url={icon}
            position={[contentLayout.iconX, contentLayout.iconY, 1.1]}
            scale={[iconSize, iconSize]}
            transparent
            material-depthTest={false}
            material-depthWrite={false}
          />
        )}
        {/* Text */}
        <Text
          position={[contentLayout.textX, contentLayout.textY, 1.1]}
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
