import React, { FC, useMemo } from 'react';
import { useSpring, a } from '@react-spring/three';
import { Arrow } from './Arrow';
import { Label } from './Label';
import {
  animationConfig,
  getLabelOffsetByType,
  getMidPoint,
  getPoints
} from '../utils';
import { Line } from './Line';
import { Theme } from '../utils';
import { useStore } from '../store';
import { Euler } from 'three';

const LABEL_FONT_SIZE = 6;

/**
 * Label positions relatively edge
 *
 * below: show label under the edge line
 * above: show label above the edge line
 * inline: show label along the edge line
 * natural: normal text positions
 */
export type EdgeLabelPosition = 'below' | 'above' | 'inline' | 'natural';

export interface EdgeProps {
  id: string;
  theme: Theme;
  animated?: boolean;
  labelPlacement?: EdgeLabelPosition;
}

export const Edge: FC<EdgeProps> = ({
  id,
  animated,
  theme,
  labelPlacement
}) => {
  const edge = useStore(state => state.edges.find(e => e.id === id));
  const { toId, fromId, label, labelVisible = false, size = 1 } = edge;

  const from = useStore(store => store.nodes.find(node => node.id === fromId));
  const to = useStore(store => store.nodes.find(node => node.id === toId));
  const draggingId = useStore(state => state.draggingId);

  const labelOffset = (size + LABEL_FONT_SIZE) / 2;
  const points = useMemo(
    () =>
      getPoints({
        from,
        to: { ...to, size: to.size + size + LABEL_FONT_SIZE }
      }),
    [from, to, size]
  );

  const realPoints = useMemo(() => getPoints({ from, to }), [from, to]);
  const midPoint = useMemo(
    () =>
      getMidPoint(
        { from: from.position, to: to.position },
        getLabelOffsetByType(labelOffset, labelPlacement)
      ),
    [from.position, to.position, labelOffset, labelPlacement]
  );

  const { isSelected, hasSelections, hasSingleSelection } = useStore(state => ({
    hasSingleSelection: state.selections?.length === 1,
    hasSelections: state.selections?.length,
    isSelected:
      state.selections?.includes(fromId) || state.selections?.includes(id)
  }));

  const selectionOpacity = hasSelections
    ? isSelected && hasSingleSelection
      ? theme.edge.opacityOnlySelected || 1
      : theme.edge.selectedOpacity || 0.1
    : theme.edge.opacity || 1;

  const [{ labelPosition }] = useSpring(
    () => ({
      from: {
        labelPosition: [0, 0, 0]
      },
      to: {
        labelPosition: [midPoint.x, midPoint.y, midPoint.z]
      },
      config: {
        ...animationConfig,
        duration: animated && !draggingId ? undefined : 0
      }
    }),
    [midPoint, animated, draggingId]
  );

  const labelRotation = useMemo(
    () =>
      new Euler(
        0,
        0,
        labelPlacement === 'natural'
          ? 0
          : Math.atan(
            (to.position.y - from.position.y) /
                (to.position.x - from.position.x)
          )
      ),
    [
      to.position.x,
      to.position.y,
      from.position.x,
      from.position.y,
      labelPlacement
    ]
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
        size={size}
        animated={animated}
      />
      {labelVisible && label && (
        <a.group position={labelPosition as any} rotation={labelRotation}>
          <Label
            text={label}
            ellipsis={15}
            stroke={theme.edge.label.stroke}
            color={
              isSelected ? theme.edge.label.activeColor : theme.edge.label.color
            }
            opacity={selectionOpacity}
            fontSize={LABEL_FONT_SIZE}
          />
        </a.group>
      )}
    </group>
  );
};

Edge.defaultProps = {
  labelPlacement: 'inline'
};
