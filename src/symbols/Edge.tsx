import React, { FC, useMemo, useState } from 'react';
import { useSpring, a } from '@react-spring/three';
import {
  Arrow,
  EdgeArrowPosition,
  getArrowSize,
  getArrowVectors
} from './Arrow';
import { Label } from './Label';
import {
  animationConfig,
  getCurvePoints,
  getLabelOffsetByType
} from '../utils';
import { Line } from './Line';
import { Theme } from '../themes';
import { useStore } from '../store';
import { CatmullRomCurve3, Euler, Vector3 } from 'three';
import { ContextMenuEvent, InternalGraphEdge } from '../types';
import { Html, useCursor } from '@react-three/drei';
import { useHoverIntent } from '../utils/useHoverIntent';

export const LABEL_FONT_SIZE = 6;

/**
 * Label positions relatively edge
 *
 * below: show label under the edge line
 * above: show label above the edge line
 * inline: show label along the edge line
 * natural: normal text positions
 */
export type EdgeLabelPosition = 'below' | 'above' | 'inline' | 'natural';

export type EdgeShape = 'line' | 'curve';

export interface EdgeProps {
  id: string;
  theme: Theme;
  animated?: boolean;
  disabled?: boolean;
  labelPlacement?: EdgeLabelPosition;
  arrowPlacement?: EdgeArrowPosition;
  shape: EdgeShape;
  contextMenu?: (event: Partial<ContextMenuEvent>) => React.ReactNode;
  onClick?: (edge: InternalGraphEdge) => void;
  onContextMenu?: (edge?: InternalGraphEdge) => void;
  onPointerOver?: (edge: InternalGraphEdge) => void;
  onPointerOut?: (edge: InternalGraphEdge) => void;
}

export const Edge: FC<EdgeProps> = ({
  id,
  animated,
  theme,
  disabled,
  labelPlacement,
  arrowPlacement,
  shape,
  contextMenu,
  onContextMenu,
  onClick,
  onPointerOver,
  onPointerOut
}) => {
  const edge = useStore(state => state.edges.find(e => e.id === id));
  const { toId, fromId, label, labelVisible = false, size = 1 } = edge;
  const curved = shape === 'curve';

  const from = useStore(store => store.nodes.find(node => node.id === fromId));
  const to = useStore(store => store.nodes.find(node => node.id === toId));
  const draggingId = useStore(state => state.draggingId);
  const [active, setActive] = useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  const labelOffset = (size + LABEL_FONT_SIZE) / 2;

  const [arrowLength, arrowSize] = useMemo(() => getArrowSize(size), [size]);

  const [curve, arrowPosition, arrowRotation] = useMemo(() => {
    const fromVector = new Vector3(
      from.position.x,
      from.position.y,
      from.position.z || 0
    );
    const toVector = new Vector3(
      to.position.x,
      to.position.y,
      to.position.z || 0
    );
    let curve = curved
      ? new CatmullRomCurve3(getCurvePoints(fromVector, toVector))
      : new CatmullRomCurve3([fromVector, toVector]);

    const [arrowPosition, arrowRotation] = getArrowVectors(
      arrowPlacement,
      curve,
      arrowLength,
      from.size
    );
    if (arrowPlacement === 'end') {
      curve = curved
        ? new CatmullRomCurve3(getCurvePoints(fromVector, arrowPosition))
        : new CatmullRomCurve3([fromVector, arrowPosition]);
    }
    return [curve, arrowPosition, arrowRotation];
  }, [curved, from, to, arrowPlacement, arrowLength]);

  const midPoint = useMemo(() => {
    const offset = getLabelOffsetByType(labelOffset, labelPlacement);
    const t = 0.5 + offset / curve.getLength();
    return curve.getPoint(t);
  }, [curve, labelOffset, labelPlacement]);

  const { isSelected, hasSelections, isActive } = useStore(state => ({
    hasSelections: state.selections?.length,
    isSelected: state.selections?.includes(id),
    isActive: state.actives?.includes(id)
  }));

  const selectionOpacity = hasSelections
    ? isSelected || isActive
      ? theme.edge.selectedOpacity
      : theme.edge.inactiveOpacity
    : theme.edge.opacity;

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

  useCursor(active && !draggingId && onClick !== undefined, 'pointer');

  const { pointerOver, pointerOut } = useHoverIntent({
    disabled,
    onPointerOver: () => {
      setActive(true);
      onPointerOver?.(edge);
    },
    onPointerOut: () => {
      setActive(false);
      onPointerOut?.(edge);
    }
  });

  return (
    <group>
      <Line
        animated={animated}
        color={
          isSelected || active || isActive
            ? theme.edge.activeFill
            : theme.edge.fill
        }
        curve={curve}
        curved={curved}
        id={id}
        opacity={selectionOpacity}
        size={size}
        onClick={() => {
          if (!disabled) {
            onClick?.(edge);
          }
        }}
        onPointerOver={pointerOver}
        onPointerOut={pointerOut}
        onContextMenu={() => {
          if (!disabled) {
            setMenuVisible(true);
            onContextMenu?.(edge);
          }
        }}
      />
      {arrowPlacement !== 'none' && (
        <Arrow
          animated={animated}
          color={
            isSelected || active || isActive
              ? theme.arrow.activeFill
              : theme.arrow.fill
          }
          curve={curve}
          length={arrowLength}
          opacity={selectionOpacity}
          position={arrowPosition}
          rotation={arrowRotation}
          size={arrowSize}
          onActive={setActive}
          onContextMenu={() => {
            if (!disabled) {
              setMenuVisible(true);
              onContextMenu?.(edge);
            }
          }}
        />
      )}
      {labelVisible && label && (
        <a.group position={labelPosition as any} rotation={labelRotation}>
          <Label
            text={label}
            ellipsis={15}
            stroke={theme.edge.label.stroke}
            color={
              isSelected || active || isActive
                ? theme.edge.label.activeColor
                : theme.edge.label.color
            }
            opacity={selectionOpacity}
            fontSize={LABEL_FONT_SIZE}
          />
        </a.group>
      )}
      {menuVisible && contextMenu && (
        <Html prepend={true} center={true}>
          {contextMenu({ data: edge, onClose: () => setMenuVisible(false) })}
        </Html>
      )}
    </group>
  );
};

Edge.defaultProps = {
  labelPlacement: 'inline',
  arrowPlacement: 'end'
};
