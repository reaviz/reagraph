import React from 'react';
import { a, SpringValue } from '@react-spring/three';
import { Color, DoubleSide } from 'three';

import { Theme } from '../../themes';

export interface RingProps {
  outerRadius: number;
  innerRadius: number;
  padding: number;
  normalizedFill: Color;
  normalizedStroke: Color;
  circleOpacity: SpringValue<number> | number;
  theme: Theme;
}

export const Ring = ({
  outerRadius,
  innerRadius,
  padding,
  normalizedFill,
  normalizedStroke,
  circleOpacity,
  theme
}: RingProps) => (
  <>
    <mesh>
      <ringGeometry attach="geometry" args={[outerRadius, 0, 128]} />
      <a.meshBasicMaterial
        attach="material"
        color={normalizedFill}
        transparent={true}
        depthTest={false}
        opacity={theme.cluster?.fill ? circleOpacity : 0}
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
        opacity={circleOpacity}
        side={DoubleSide}
        fog={true}
      />
    </mesh>
  </>
);
