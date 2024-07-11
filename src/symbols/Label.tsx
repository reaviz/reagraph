import React, { FC, useMemo } from 'react';
import { Billboard, RoundedBox, Text } from 'glodrei';
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

  /**
   * Maximum width of the label.
   */
  maxWidth?: number;

  /**
   * Background color of the label.
   */
  backgroundColor?: ColorRepresentation;

  /**
   * Border radius of the label.
   */
  borderRadius?: number;
}

export const Label: FC<LabelProps> = ({
  text,
  fontSize,
  fontUrl,
  color,
  opacity,
  stroke,
  active,
  rotation,
  maxWidth = 100,
  ellipsis = 100,
  backgroundColor,
  borderRadius
}) => {
  const shortText = ellipsis && !active ? ellipsize(text, ellipsis) : text;
  const normalizedColor = useMemo(() => new Color(color), [color]);
  const normalizedBackgroundColor = useMemo(
    () => new Color(backgroundColor),
    [backgroundColor]
  );
  const normalizedStroke = useMemo(
    () => (stroke ? new Color(stroke) : undefined),
    [stroke]
  );

  return (
    <Billboard position={[0, 0, 1]}>
      <RoundedBox
        args={[maxWidth, fontSize, 1]} // Width, height, depth.
        radius={0.05}
      >
        <meshBasicMaterial color={normalizedBackgroundColor} />
        <Text
          font={fontUrl}
          fontSize={fontSize}
          color={normalizedColor}
          fillOpacity={opacity}
          textAlign="center"
          outlineWidth={stroke ? 1 : 0}
          outlineColor={normalizedStroke}
          depthOffset={0}
          maxWidth={maxWidth}
          overflowWrap="break-word"
          rotation={rotation}
        >
          {shortText}
        </Text>
      </RoundedBox>
    </Billboard>
  );
};

Label.defaultProps = {
  opacity: 1,
  fontSize: 7,
  color: '#2A6475',
  ellipsis: 100
};
