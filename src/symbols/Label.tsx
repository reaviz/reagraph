import React, { FC } from 'react';
import ellipsize from 'ellipsize';
import { Billboard, Text } from '@react-three/drei';

export interface LabelProps {
  text: string;
  fontUrl?: string;
  fontSize?: number;
  color?: string;
  opacity?: number;
}

export const Label: FC<LabelProps> = ({
  text,
  fontSize,
  fontUrl,
  color,
  opacity
}) => {
  const shortText = ellipsize(text, 18);
  return (
    <Billboard position={[0, 0, 1]}>
      <Text
        font={fontUrl}
        fontSize={fontSize}
        color={color}
        fillOpacity={opacity}
      >
        {shortText}
      </Text>
    </Billboard>
  );
};

Label.defaultProps = {
  opacity: 1,
  fontSize: 7,
  color: '#2A6475'
};
