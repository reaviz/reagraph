import React, { FC, useMemo } from 'react';
import { Arrow } from './Arrow';
import { Label } from './Label';
import { animationConfig, getMidPoint, getPoints } from '../utils';
import { Line } from './Line';
import { Theme } from '../utils/themes';
import { InternalGraphEdge } from '../types';
import { motion } from 'framer-motion-3d';

export interface EdgeProps extends InternalGraphEdge {
  theme: Theme;
  animated?: boolean;
  selections?: string[];
}

export const Edge: FC<EdgeProps> = ({
  from,
  to,
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

  return (
    <group>
      <Line
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
        <motion.group
          intial={{
            x: 0,
            y: 0,
            z: 2
          }}
          animate={{
            x: midPoint.x,
            y: midPoint.y,
            z: 2
          }}
          transition={{
            ...animationConfig,
            type: animated ? 'spring' : false
          }}
        >
          <Label
            text={label}
            color={isSelected ? theme.edge.activeColor : theme.edge.color}
            opacity={selectionOpacity}
            fontSize={6}
          />
        </motion.group>
      )}
    </group>
  );
};

Edge.defaultProps = {
  labelVisible: false,
  size: 1
};
