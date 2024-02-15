import React, { FC, useMemo, useState } from 'react';
import { useSpring, a } from '@react-spring/three';
import { Arrow, EdgeArrowPosition } from './Arrow';
import { Label } from './Label';
import {
  animationConfig,
  calculateEdgeCurveOffset,
  getArrowSize,
  getArrowVectors,
  getCurve,
  getLabelOffsetByType,
  getMidPoint,
  getVector
} from '../utils';
import { Line } from './Line';
import { Theme } from '../themes';
import { useStore } from '../store';
import { ContextMenuEvent, InternalGraphEdge } from '../types';
import { Html, useCursor } from 'glodrei';
import { useHoverIntent } from '../utils/useHoverIntent';
import { Euler, Vector3 } from 'three';

/**
 * Label positions relatively edge.
 *
 * - below: show label under the edge line
 * - above: show label above the edge line
 * - inline: show label along the edge line
 * - natural: normal text positions
 */
export type EdgeLabelPosition = 'below' | 'above' | 'inline' | 'natural';

/**
 * Type of edge interpolation.
 *
 * - Linear is straight
 * - Curved is curved
 */
export type EdgeInterpolation = 'linear' | 'curved';

export interface EdgeProps {
  /**
   * The url for the label font.
   */
  labelFontUrl?: string;

  /**
   * The unique identifier of the edge.
   */
  id: string;

  /**
   * Whether the edge should be animated.
   */
  animated?: boolean;

  /**
   * Whether the edge should be disabled.
   */
  disabled?: boolean;

  /**
   * The placement of the edge label.
   */
  labelPlacement?: EdgeLabelPosition;

  /**
   * The placement of the edge arrow.
   */
  arrowPlacement?: EdgeArrowPosition;

  /**
   * The type of interpolation used to draw the edge.
   */
  interpolation: EdgeInterpolation;

  /**
   * A function that returns the context menu for the edge.
   */
  contextMenu?: (event: Partial<ContextMenuEvent>) => React.ReactNode;

  /**
   * A function that is called when the edge is clicked.
   */
  onClick?: (edge: InternalGraphEdge) => void;

  /**
   * A function that is called when the edge is right-clicked.
   */
  onContextMenu?: (edge?: InternalGraphEdge) => void;

  /**
   * A function that is called when the mouse pointer is moved over the edge.
   */
  onPointerOver?: (edge: InternalGraphEdge) => void;

  /**
   * A function that is called when the mouse pointer is moved out of the edge.
   */
  onPointerOut?: (edge: InternalGraphEdge) => void;
}

const LABEL_PLACEMENT_OFFSET = 3;

export const Edge: FC<EdgeProps> = ({
  animated,
  arrowPlacement,
  contextMenu,
  disabled,
  labelPlacement,
  id,
  interpolation,
  labelFontUrl,
  onContextMenu,
  onClick,
  onPointerOver,
  onPointerOut
}) => {
  const theme = useStore(state => state.theme);
  const draggingId = useStore(state => state.draggingId);

  // UI states
  const [active, setActive] = useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  // Edge data
  const edges = useStore(state => state.edges);
  const edge = edges.find(e => e.id === id);
  const { target, source, label, labelVisible = false, size = 1 } = edge;
  const from = useStore(store => store.nodes.find(node => node.id === source));
  const to = useStore(store => store.nodes.find(node => node.id === target));

  // Edge properties
  const labelOffset = (size + theme.edge.label.fontSize) / 2;
  const [arrowLength, arrowSize] = useMemo(() => getArrowSize(size), [size]);
  const { curveOffset, curved } = useMemo(
    () =>
      calculateEdgeCurveOffset({
        edge,
        edges,
        curved: interpolation === 'curved'
      }),
    [edge, edges, interpolation]
  );

  const [curve, arrowPosition, arrowRotation] = useMemo(() => {
    const fromVector = getVector(from);
    const fromOffset = from.size;
    const toVector = getVector(to);
    const toOffset = to.size;

    let curve = getCurve(
      fromVector,
      fromOffset,
      toVector,
      toOffset,
      curved,
      curveOffset
    );

    const [arrowPosition, arrowRotation] = getArrowVectors(
      arrowPlacement,
      curve,
      arrowLength
    );

    if (arrowPlacement === 'end') {
      curve = getCurve(
        fromVector,
        fromOffset,
        arrowPosition,
        0,
        curved,
        curveOffset
      );
    }

    return [curve, arrowPosition, arrowRotation];
  }, [from, to, curved, curveOffset, arrowPlacement, arrowLength]);

  const midPoint = useMemo(() => {
    let newMidPoint = getMidPoint(
      from.position,
      to.position,
      getLabelOffsetByType(labelOffset, labelPlacement)
    );

    if (curved) {
      // Offset the label to the mid point of the curve
      const offset = new Vector3().subVectors(newMidPoint, curve.getPoint(0.5));
      switch (labelPlacement) {
      case 'above':
        offset.y = offset.y - LABEL_PLACEMENT_OFFSET;
        break;
      case 'below':
        offset.y = offset.y + LABEL_PLACEMENT_OFFSET;
        break;
      }
      newMidPoint = newMidPoint.sub(offset);
    }

    return newMidPoint;
  }, [from.position, to.position, labelOffset, labelPlacement, curved, curve]);

  const isSelected = useStore(state => state.selections?.includes(id));
  const hasSelections = useStore(state => state.selections?.length);
  const isActive = useStore(state => state.actives?.includes(id));

  const selectionOpacity = hasSelections
    ? isSelected || isActive
      ? theme.edge.selectedOpacity
      : theme.edge.inactiveOpacity
    : theme.edge.opacity;

  const [{ labelPosition }] = useSpring(
    () => ({
      from: {
        labelPosition: midPoint
          ? [midPoint.x, midPoint.y, midPoint.z]
          : [0, 0, 0]
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
        curveOffset={curveOffset}
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
            fontUrl={labelFontUrl}
            stroke={theme.edge.label.stroke}
            color={
              isSelected || active || isActive
                ? theme.edge.label.activeColor
                : theme.edge.label.color
            }
            opacity={selectionOpacity}
            fontSize={theme.edge.label.fontSize}
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
