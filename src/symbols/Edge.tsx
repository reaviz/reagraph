import React, { FC, useMemo } from 'react';
import { useSpring, a } from '@react-spring/three';
import { Arrow } from './Arrow';
import { Label } from './Label';
import { animationConfig, getMidPoint, getPoints } from '../utils';
import { Line } from './Line';
import { Theme } from '../utils/themes';
import { InternalGraphEdge } from '../types';

export interface EdgeProps extends InternalGraphEdge {
  theme: Theme;
  animated?: boolean;
  selections?: string[];
}

export const Edge: FC<EdgeProps> = ({
  from,
  to,
  id,
  animated,
  position,
  label,
  theme,
  selections,
  labelVisible,
  size
}) => {
  const arrowSize = Math.max(size * 0.3, 1);
  const points = useMemo(
    () => getPoints({ from, to: { ...to, size: to.size + arrowSize + 6 } }),
    [from, to, arrowSize]
  );

  const realPoints = useMemo(() => getPoints({ from, to }), [from, to]);
  const midPoint = useMemo(() => getMidPoint(position), [position]);

  const hasSelections = selections?.length > 0;
  const isSelected = selections?.includes(from.id);
  const selectionOpacity = hasSelections
    ? isSelected && selections?.length === 1
      ? 0.5
      : 0.1
    : 0.5;

  const [{ labelPosition }] = useSpring(
    () => ({
      from: {
        labelPosition: [0, 0, 2]
      },
      to: {
        labelPosition: [midPoint.x, midPoint.y, 2]
      },
      config: {
        ...animationConfig,
        duration: animated ? undefined : 0
      }
    }),
    [midPoint, animated]
  );

  return (
    <group>
      <Line
        id={id}
        color={isSelected ? theme.edge.activeFill : theme.edge.fill}
        opacity={selectionOpacity}
        points={points}
        size={size}
        animated={animated}
      />
      <Arrow
        position={realPoints}
        color={isSelected ? theme.arrow.activeFill : theme.arrow.fill}
        opacity={selectionOpacity}
        size={arrowSize}
        animated={animated}
      />
      {labelVisible && label && (
        <a.group position={labelPosition as any}>
          <Label
            text={label}
            color={isSelected ? theme.edge.activeColor : theme.edge.color}
            opacity={selectionOpacity}
            fontSize={6}
          />
        </a.group>
      )}
    </group>
  );
};

Edge.defaultProps = {
  labelVisible: false,
  size: 1
};
