import React, { FC, useMemo } from 'react';
import { useSpring, a } from '@react-spring/three';
import { Arrow } from './Arrow';
import { Label } from './Label';
import { animationConfig, getMidPoint, getPoints } from '../utils';
import { Line } from './Line';
import { Theme } from '../utils/themes';
import { InternalGraphEdge } from '../types';
import { useStore } from '../store';

export interface EdgeProps {
  id: string;
  theme: Theme;
  animated?: boolean;
}

export const Edge: FC<EdgeProps> = ({ id, animated, theme }) => {
  const edge = useStore(state => state.edges.find(e => e.id === id));
  const { toId, fromId, label, labelVisible = false, size = 1 } = edge;

  const from = useStore(store => store.nodes.find(node => node.id === fromId));
  const to = useStore(store => store.nodes.find(node => node.id === toId));
  const dragging = useStore(state => state.dragging);

  const arrowSize = Math.max(size * 0.3, 1);
  const points = useMemo(
    () => getPoints({ from, to: { ...to, size: to.size + arrowSize + 6 } }),
    [from, to, arrowSize]
  );

  const realPoints = useMemo(() => getPoints({ from, to }), [from, to]);
  const midPoint = useMemo(
    () => getMidPoint({ from: from.position, to: to.position }),
    [from.position, to.position]
  );

  const { isSelected, hasSelections, hasSingleSelection } = useStore(state => ({
    hasSingleSelection: state.selections?.length === 1,
    hasSelections: state.selections?.length,
    isSelected: state.selections?.includes(fromId)
  }));

  const selectionOpacity = hasSelections
    ? isSelected && hasSingleSelection
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
        duration: animated && !dragging ? undefined : 0
      }
    }),
    [midPoint, animated, dragging]
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
