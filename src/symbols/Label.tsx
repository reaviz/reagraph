import React, { FC } from 'react';
import ellipsize from 'ellipsize';
import { Billboard, Text } from '@react-three/drei';

export interface LabelProps {
  text: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  opacity?: number;
}

export const Label: FC<LabelProps> = ({
  text,
  fontSize,
  fontFamily,
  color,
  opacity
}) => {
  const shortText = ellipsize(text, 18);
  return (
    <Billboard position={[0, 0, 1]}>
      <Text
        font={fontFamily}
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
  fontSize: 12,
  fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif',
  color: '#000'
};
