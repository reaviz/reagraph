import React, { FC, useMemo } from 'react';
import { Billboard, RoundedBox, Text } from 'glodrei';
import { Color, ColorRepresentation, Euler } from 'three';
import ellipsize from 'ellipsize';
import { a } from '@react-spring/three';

const calculateTextSize = (
  text: string,
  fontSize: number,
  maxWidth: number,
  ellipsis: number,
  active: boolean
) => {
  const shortText = ellipsis && !active ? ellipsize(text, ellipsis) : text;
  const lines = [];
  let currentLine = '';
  const words = shortText.split(' ');

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = testLine.length * fontSize * 0.5;

    if (testWidth > maxWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  const width =
    Math.min(
      maxWidth,
      lines.reduce(
        (max, line) => Math.max(max, line.length * fontSize * 0.5),
        0
      )
    ) + 14;
  const height = lines.length * fontSize + 6;

  return { width, height, text: lines.join('\n') };
};

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

  /**
   * Type of the label.
   */
  type?: 'node' | 'edge';
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
  const normalizedColor = useMemo(() => new Color(color), [color]);
  const normalizedBackgroundColor = useMemo(
    () => new Color(backgroundColor),
    [backgroundColor]
  );
  const normalizedStroke = useMemo(
    () => (stroke ? new Color(stroke) : undefined),
    [stroke]
  );

  const {
    width,
    height,
    text: processedText
  } = useMemo(
    () => calculateTextSize(text, fontSize, maxWidth, ellipsis, active),
    [text, fontSize, maxWidth, ellipsis, active]
  );

  return (
    <Billboard>
      {backgroundColor ? (
        <mesh>
          <RoundedBox
            position={[0, height > 18 ? -3 : 0, 10]}
            args={[width, height, 0]} // Width, height, depth.
            radius={borderRadius}
            rotation={rotation}
            // scale={active ? [1.05, 1.05, 1.05] : [1, 1, 1]}
          >
            <Text
              font={fontUrl}
              fontSize={fontSize}
              color={normalizedColor}
              fillOpacity={opacity}
              textAlign="center"
              outlineWidth={stroke ? 1 : 0}
              outlineColor={stroke ? normalizedStroke : null}
              depthOffset={0}
              maxWidth={maxWidth}
              overflowWrap="break-word"
            >
              {processedText}
            </Text>
            <a.meshBasicMaterial
              attach="material"
              opacity={opacity}
              depthTest={true}
              color={normalizedBackgroundColor}
            />
          </RoundedBox>
        </mesh>
      ) : (
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
          {processedText}
        </Text>
      )}
    </Billboard>
  );
};

Label.defaultProps = {
  opacity: 1,
  fontSize: 4,
  color: '#2A6475',
  ellipsis: 100
};
