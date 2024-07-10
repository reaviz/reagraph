import React, { FC, useMemo } from 'react';
import { Billboard, Html } from 'glodrei';
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
  const normalizedBackgroundColor = useMemo(
    () => new Color(backgroundColor),
    [backgroundColor]
  );
  const normalizedColor = useMemo(() => new Color(color), [color]);

  return (
    <Billboard position={[0, 0, 1]}>
      <Html center>
        <div
          style={{
            backgroundColor: `${normalizedBackgroundColor.getStyle()}`,
            borderRadius,
            padding: '5px',
            display: 'inline-block',
            maxWidth,
            overflowWrap: 'break-word',
            transform: `rotate(${rotation}deg)`
          }}
        >
          <span
            style={{
              fontFamily: fontUrl,
              fontSize,
              color: `${normalizedColor.getStyle()}`,
              opacity,
              textAlign: 'center',
              textDecoration: active ? 'underline' : 'none'
            }}
          >
            {shortText}
          </span>
        </div>
      </Html>
    </Billboard>
  );
};

Label.defaultProps = {
  opacity: 1,
  fontSize: 7,
  color: '#2A6475',
  ellipsis: 100
};
