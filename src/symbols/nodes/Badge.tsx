import { a, useSpring } from '@react-spring/three';
import { Billboard, Image, RoundedBox, Text } from '@react-three/drei';
import type { FC } from 'react';
import React, { useMemo } from 'react';
import { Color } from 'three';

import type { NodeRendererProps } from '../../types';
import { animationConfig } from '../../utils';

export type BadgePosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'center';

export type IconPosition = 'start' | 'end';

export interface BadgeProps extends Omit<NodeRendererProps, 'opacity'> {
  /**
   * The text to display in the badge.
   */
  label: string;

  /**
   * Background color of the badge.
   */
  backgroundColor?: string;

  /**
   * Opacity of the badge background and stroke (0-1).
   * Default: 1
   */
  opacity?: number;

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
   * Default: 0.15
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

  /**
   * Font size for the badge text.
   */
  fontSize?: number;

  /**
   * Font weight for the badge text (100-900).
   * Values outside this range will be clamped to the nearest valid value.
   * Common values: 400 (normal), 700 (bold), 900 (extra bold).
   */
  fontWeight?: number;

  /**
   * Character width estimate for calculating text width.
   * Default: 0.2
   */
  charWidthEstimate?: number;

  /**
   * Gap between icon and text.
   * Default: 0.01
   */
  iconTextGap?: number;
}

const DEFAULT_FONT_SIZE = 0.3;

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
  padding = 0.15,
  icon,
  iconSize = 0.35,
  iconPosition = 'start',
  fontSize = DEFAULT_FONT_SIZE,
  fontWeight,
  charWidthEstimate = 0.2,
  iconTextGap = 0.01
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

  // Normalize fontWeight to valid CSS font-weight values (100-900 in increments of 100)
  const normalizedFontWeight = useMemo(() => {
    if (fontWeight === undefined) return undefined;
    // Round to nearest hundred and clamp to 100-900 range
    return Math.max(100, Math.min(900, Math.round(fontWeight / 100) * 100));
  }, [fontWeight]);

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

  // Shared text size calculations (used by both badgeDimensions and contentLayout)
  const textSizeCalculations = useMemo(() => {
    const fontSizeScale = fontSize / DEFAULT_FONT_SIZE;
    const fontWeightMultiplier = (normalizedFontWeight ?? 0) >= 700 ? 1.1 : 1;
    const adjustedCharWidth =
      charWidthEstimate * fontSizeScale * fontWeightMultiplier;
    const estimatedTextWidth = label.length * adjustedCharWidth;

    return {
      fontSizeScale,
      fontWeightMultiplier,
      adjustedCharWidth,
      estimatedTextWidth
    };
  }, [fontSize, normalizedFontWeight, charWidthEstimate, label.length]);

  // Calculate dynamic badge dimensions based on text length and icon
  const badgeDimensions = useMemo(() => {
    const baseWidth = 0.5;
    const baseHeight = 0.5;
    const minWidth = baseWidth;
    const minHeight = baseHeight;

    const { fontSizeScale, estimatedTextWidth } = textSizeCalculations;

    // Calculate content width (text + icon + gap, no padding yet)
    let contentWidth = estimatedTextWidth;
    if (icon) {
      contentWidth += iconSize + iconTextGap;
    }

    // Add padding to total width (padding on both left and right sides)
    const estimatedWidth = Math.max(minWidth, contentWidth + padding * 2);

    // Scale height based on fontSize
    const charCount = label.length;
    const estimatedHeight = Math.max(
      minHeight,
      Math.min(
        charCount * 0.05 * fontSizeScale + padding * 0.5,
        0.8 * fontSizeScale + padding * 0.5
      )
    );

    return {
      width: estimatedWidth,
      height: estimatedHeight
    };
  }, [
    textSizeCalculations,
    label.length,
    padding,
    icon,
    iconSize,
    iconTextGap
  ]);

  const { scale } = useSpring({
    from: {
      scale: [0.00001, 0.00001, 0.00001]
    },
    to: {
      scale: [size * badgeSize, size * badgeSize, size * badgeSize]
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

    const { estimatedTextWidth } = textSizeCalculations;
    const totalContentWidth = iconSize + iconTextGap + estimatedTextWidth;
    const startX = -totalContentWidth / 2;

    if (iconPosition === 'start') {
      return {
        iconX: startX + iconSize / 2,
        iconY: 0,
        textX: startX + iconSize + iconTextGap + estimatedTextWidth / 2,
        textY: 0
      };
    } else {
      return {
        textX: startX + estimatedTextWidth / 2,
        textY: 0,
        iconX: startX + estimatedTextWidth + iconTextGap + iconSize / 2,
        iconY: 0
      };
    }
  }, [textSizeCalculations, icon, iconSize, iconPosition, iconTextGap]);

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
              material-opacity={opacity}
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
            material-opacity={opacity}
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
          fontSize={fontSize}
          fontWeight={normalizedFontWeight}
          color={normalizedTextColor}
          anchorX="center"
          anchorY="middle"
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
