import React, { FC, useMemo } from 'react';
import { Billboard, Text, RoundedBox } from '@react-three/drei';
import { Color, ColorRepresentation, Euler } from 'three';
import ellipsize from 'ellipsize';

export interface LabelProps {
  /**
   * Text to render.
   */
  text: string;

  /**
   * Font URL.
   * Reference: https://github.com/reaviz/reagraph/issues/23
   */
  fontUrl?: string;

  /**
   * Size of the font.
   */
  fontSize?: number;

  /**
   * Color of the text.
   */
  color?: ColorRepresentation;

  /**
   * Stroke of the text.
   */
  stroke?: ColorRepresentation;

  /**
   * Background color of the label.
   */
  backgroundColor?: ColorRepresentation;

  /**
   * Opacity of the background.
   */
  backgroundOpacity?: number;

  /**
   * Padding around the text for background sizing.
   */
  backgroundPadding?: number;

  /**
   * Color of the background stroke/border.
   */
  strokeColor?: ColorRepresentation;

  /**
   * Size of the background stroke/border.
   */
  strokeSize?: number;

  /**
   * Corner radius of the background.
   */
  radius?: number;

  /**
   * Opacity for the label.
   */
  opacity?: number;

  /**
   * The lenth of which to start the ellipsis.
   */
  ellipsis?: number;

  /**
   * Whether the label is active ( dragging, hover, focus ).
   */
  active?: boolean;

  /**
   * Rotation of the label.
   */
  rotation?: Euler | [number, number, number];
}

export const Label: FC<LabelProps> = ({
  text,
  fontSize = 7,
  fontUrl,
  color = '#2A6475',
  opacity = 1,
  stroke,
  backgroundColor,
  backgroundOpacity = 1,
  backgroundPadding = 1,
  strokeColor,
  strokeSize = 0,
  radius = 0.1,
  active,
  ellipsis = 75,
  rotation
}) => {
  const shortText = ellipsis && !active ? ellipsize(text, ellipsis) : text;
  const normalizedColor = useMemo(() => new Color(color), [color]);
  const normalizedStroke = useMemo(
    () => (stroke ? new Color(stroke) : undefined),
    [stroke]
  );
  const normalizedBackgroundColor = useMemo(
    () => (backgroundColor ? new Color(backgroundColor) : null),
    [backgroundColor]
  );
  const normalizedStrokeColor = useMemo(
    () => (strokeColor ? new Color(strokeColor) : null),
    [strokeColor]
  );
  // Normalize the radius to be between 0 and 3
  const normalizedRadius = useMemo(
    () => Math.min(radius * fontSize, 3),
    [radius, fontSize]
  );

  // Calculate background dimensions based on text and fontSize
  const backgroundDimensions = useMemo(() => {
    const charCount = shortText.length;
    const estimatedWidth = charCount * fontSize * 0.6 + backgroundPadding * 2;
    const estimatedHeight = fontSize * 1.2 + backgroundPadding * 2;

    return {
      width: estimatedWidth,
      height: estimatedHeight
    };
  }, [shortText, fontSize, backgroundPadding]);

  return (
    <Billboard position={[0, 0, 11]} renderOrder={1}>
      {/* Stroke layer - rendered behind the background */}
      {strokeSize > 0 && normalizedStrokeColor && normalizedBackgroundColor && (
        <mesh position={[0, 0, 10]}>
          <RoundedBox
            args={[
              backgroundDimensions.width + strokeSize,
              backgroundDimensions.height + strokeSize,
              0.1
            ]}
            radius={normalizedRadius}
            smoothness={8}
            material-color={normalizedStrokeColor}
            material-transparent={true}
            material-opacity={backgroundOpacity}
          />
        </mesh>
      )}
      {/* Background layer */}
      {normalizedBackgroundColor && (
        <mesh position={[0, 0, 10]}>
          <RoundedBox
            args={[
              backgroundDimensions.width,
              backgroundDimensions.height,
              0.1
            ]}
            radius={normalizedRadius}
            smoothness={8}
            material-color={normalizedBackgroundColor}
            material-transparent={true}
            material-opacity={backgroundOpacity}
          />
        </mesh>
      )}
      <Text
        position={[0, 0, 11]}
        font={fontUrl}
        fontSize={fontSize}
        color={normalizedColor}
        fillOpacity={opacity}
        textAlign="center"
        outlineWidth={stroke ? 1 : 0}
        outlineColor={normalizedStroke}
        depthOffset={0}
        maxWidth={100}
        overflowWrap="break-word"
        rotation={rotation}
      >
        {shortText}
      </Text>
    </Billboard>
  );
};
