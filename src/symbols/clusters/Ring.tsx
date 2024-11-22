import React, { FC } from 'react';
import { a, useSpring } from '@react-spring/three';
import { Color, DoubleSide } from 'three';

import { Theme } from '../../themes';
import { animationConfig } from '../../utils';

export interface RingProps {
  outerRadius: number;
  innerRadius: number;
  padding: number;
  normalizedFill: Color;
  normalizedStroke: Color;
  opacity: number;
  animated: boolean;
  theme: Theme;
}

export const Ring: FC<RingProps> = ({
  outerRadius,
  innerRadius,
  padding,
  normalizedFill,
  normalizedStroke,
  opacity,
  animated,
  theme
}) => {
  const { opacity: springOpacity } = useSpring({
    from: { opacity: 0 },
    to: { opacity },
    config: {
      ...animationConfig,
      duration: animated ? undefined : 0
    }
  });

  return (
    <>
      <mesh>
        <ringGeometry attach="geometry" args={[outerRadius, 0, 128]} />
        <a.meshBasicMaterial
          attach="material"
          color={normalizedFill}
          transparent={true}
          depthTest={false}
          opacity={theme.cluster?.fill ? springOpacity : 0}
          side={DoubleSide}
          fog={true}
        />
      </mesh>
      <mesh>
        <ringGeometry
          attach="geometry"
          args={[outerRadius, innerRadius + padding, 128]}
        />
        <a.meshBasicMaterial
          attach="material"
          color={normalizedStroke}
          transparent={true}
          depthTest={false}
          opacity={springOpacity}
          side={DoubleSide}
          fog={true}
        />
      </mesh>
    </>
  );
};
