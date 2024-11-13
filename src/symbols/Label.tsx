import React, { FC, useMemo } from 'react';
import { Billboard, Text } from 'glodrei';
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
}

export const Label: FC<LabelProps> = ({
  text,
  fontSize = 7,
  fontUrl,
  color = '#2A6475',
  opacity = 1,
  stroke,
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

  return (
    <Billboard position={[0, 0, 1]}>
      <Text
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
