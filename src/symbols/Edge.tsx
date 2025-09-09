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
import { useStore } from '../store';
import type { ContextMenuEvent, InternalGraphEdge } from '../types';
import { Html, useCursor } from '@react-three/drei';
import { useHoverIntent } from '../utils/useHoverIntent';
import { CatmullRomCurve3, Euler, Vector3 } from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { calculateSubLabelOffset, getSelfLoopCurve } from '../utils/position';
import { SelfLoop } from './edges/SelfLoop';

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
 * SubLabel positions relatively to the main label.
 *
 * - below: show subLabel below the main label
 * - above: show subLabel above the main label
 */
export type EdgeSubLabelPosition = 'below' | 'above';

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
   * The placement of the edge subLabel relative to the main label.
   */
  subLabelPlacement?: EdgeSubLabelPosition;

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
  onClick?: (edge: InternalGraphEdge, event: ThreeEvent<MouseEvent>) => void;

  /**
   * A function that is called when the edge is right-clicked.
   */
  onContextMenu?: (edge?: InternalGraphEdge) => void;

  /**
   * A function that is called when the mouse pointer is moved over the edge.
   */
  onPointerOver?: (
    edge: InternalGraphEdge,
    event: ThreeEvent<PointerEvent>
  ) => void;

  /**
   * A function that is called when the mouse pointer is moved out of the edge.
   */
  onPointerOut?: (
    edge: InternalGraphEdge,
    event: ThreeEvent<PointerEvent>
  ) => void;
}

const LABEL_PLACEMENT_OFFSET = 3;

export const Edge: FC<EdgeProps> = ({
  animated,
  arrowPlacement = 'end',
  contextMenu,
  disabled,
  labelPlacement = 'inline',
  id,
  interpolation,
  labelFontUrl,
  onContextMenu,
  onClick,
  onPointerOver,
  onPointerOut,
  subLabelPlacement = 'below'
}) => {
  const theme = useStore(state => state.theme);
  const isDragging = useStore(state => state.draggingIds.length > 0);

  // UI states
  const [active, setActive] = useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  // Edge data
  const edges = useStore(state => state.edges);
  const edge = edges.find(e => e.id === id);
  const {
    target,
    source,
    label,
    subLabel,
    labelVisible = false,
    size = 1,
    fill,
    dashed = false,
    dashArray = [3, 1]
  } = edge;

  // Use subLabelPlacement from edge data if available, otherwise use the prop value
  const effectiveSubLabelPlacement =
    edge.subLabelPlacement || subLabelPlacement;

  const from = useStore(store => store.nodes.find(node => node.id === source));
  const to = useStore(store => store.nodes.find(node => node.id === target));

  // Detect self-loop
  const isSelfLoop = from.id === to.id;

  // Edge properties
  const labelOffset = (size + theme.edge.label.fontSize) / 2;
  const [arrowLength, arrowSize] = useMemo(() => getArrowSize(size), [size]);

  // Use edge-specific interpolation if available, otherwise use global interpolation
  const effectiveInterpolation = edge.interpolation || interpolation;

  // Use edge-specific arrow placement if available, otherwise use global arrow placement
  const effectiveArrowPlacement = edge.arrowPlacement || arrowPlacement;

  const { curveOffset, curved } = useMemo(
    () =>
      calculateEdgeCurveOffset({
        edge,
        edges,
        curved: effectiveInterpolation === 'curved'
      }),
    [edge, edges, effectiveInterpolation]
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
      effectiveArrowPlacement,
      curve,
      arrowLength
    );

    if (effectiveArrowPlacement === 'end') {
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
  }, [from, to, curved, curveOffset, effectiveArrowPlacement, arrowLength]);

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
  const center = useStore(state => state.centerPosition);

  const selectionOpacity = hasSelections
    ? isSelected || isActive
      ? theme.edge.selectedOpacity
      : theme.edge.inactiveOpacity
    : theme.edge.opacity;

  // Calculate subLabel position based on edge orientation and subLabelPlacement
  const subLabelOffset = useMemo(() => {
    return calculateSubLabelOffset(
      from.position,
      to.position,
      effectiveSubLabelPlacement
    );
  }, [from.position, to.position, effectiveSubLabelPlacement]);

  const [{ labelPosition }] = useSpring(
    () => ({
      from: {
        labelPosition: center ? [center.x, center.y, center.z] : [0, 0, 0]
      },
      to: {
        labelPosition: [midPoint.x, midPoint.y, midPoint.z]
      },
      config: {
        ...animationConfig,
        duration: animated && !isDragging ? undefined : 0
      }
    }),
    [midPoint, animated, isDragging]
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

  useCursor(active && !isDragging && onClick !== undefined, 'pointer');

  const { pointerOver, pointerOut } = useHoverIntent({
    disabled,
    onPointerOver: (event: ThreeEvent<PointerEvent>) => {
      setActive(true);
      onPointerOver?.(edge, event);
    },
    onPointerOut: (event: ThreeEvent<PointerEvent>) => {
      setActive(false);
      onPointerOut?.(edge, event);
    }
  });

  const selfLoopCurve = useMemo(() => getSelfLoopCurve(from), [from]);

  const arrowComponent = useMemo(() => {
    if (effectiveArrowPlacement === 'none') return null;

    let position: Vector3;
    let rotation: Vector3;

    if (isSelfLoop && selfLoopCurve) {
      // Arrow for self-loop
      const uEnd = 0.58;
      const uMid = 0.25;
      if (effectiveArrowPlacement === 'mid') {
        position = selfLoopCurve.getPointAt(uMid);
        rotation = selfLoopCurve.getTangentAt(uMid);
      } else {
        // end is default
        position = selfLoopCurve.getPointAt(uEnd);
        rotation = selfLoopCurve.getTangentAt(uEnd);
      }
    } else {
      // Arrow for normal edge
      position = arrowPosition;
      rotation = arrowRotation;
    }

    return (
      <Arrow
        animated={animated}
        color={
          isSelected || active || isActive
            ? theme.arrow.activeFill
            : fill || theme.arrow.fill
        }
        length={arrowLength}
        opacity={selectionOpacity}
        position={position}
        rotation={rotation}
        size={arrowSize}
        onActive={setActive}
        onContextMenu={() => {
          if (!disabled) {
            setMenuVisible(true);
            onContextMenu?.(edge);
          }
        }}
      />
    );
  }, [
    fill,
    active,
    animated,
    arrowLength,
    effectiveArrowPlacement,
    arrowPosition,
    arrowRotation,
    arrowSize,
    disabled,
    edge,
    isActive,
    isSelected,
    onContextMenu,
    selectionOpacity,
    theme.arrow.activeFill,
    theme.arrow.fill,
    isSelfLoop,
    selfLoopCurve
  ]);

  const labelComponent = useMemo(
    () =>
      labelVisible &&
      label && (
        <a.group
          position={labelPosition as any}
          onContextMenu={() => {
            if (!disabled) {
              setMenuVisible(true);
              onContextMenu?.(edge);
            }
          }}
          onPointerOver={pointerOver}
          onPointerOut={pointerOut}
        >
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
            rotation={labelRotation}
            active={isSelected || active || isActive}
          />

          {subLabel && (
            <group position={[subLabelOffset.x, subLabelOffset.y, 0]}>
              <Label
                text={subLabel}
                ellipsis={15}
                fontUrl={labelFontUrl}
                stroke={theme.edge.subLabel?.stroke || theme.edge.label.stroke}
                active={isSelected || active || isActive}
                color={
                  isSelected || active || isActive
                    ? theme.edge.subLabel?.activeColor ||
                      theme.edge.label.activeColor
                    : theme.edge.subLabel?.color || theme.edge.label.color
                }
                opacity={selectionOpacity}
                fontSize={
                  theme.edge.subLabel?.fontSize ||
                  theme.edge.label.fontSize * 0.8
                }
                rotation={labelRotation}
              />
            </group>
          )}
        </a.group>
      ),
    [
      active,
      disabled,
      edge,
      isActive,
      isSelected,
      label,
      subLabel,
      labelFontUrl,
      labelPosition,
      subLabelOffset,
      labelRotation,
      labelVisible,
      onContextMenu,
      pointerOut,
      pointerOver,
      selectionOpacity,
      theme.edge.label.activeColor,
      theme.edge.label.color,
      theme.edge.label.fontSize,
      theme.edge.label.stroke,
      theme.edge.subLabel?.stroke,
      theme.edge.subLabel?.activeColor,
      theme.edge.subLabel?.color,
      theme.edge.subLabel?.fontSize
    ]
  );

  const menuComponent = useMemo(
    () =>
      menuVisible &&
      contextMenu && (
        <Html prepend={true} center={true} position={midPoint}>
          {contextMenu({ data: edge, onClose: () => setMenuVisible(false) })}
        </Html>
      ),
    [menuVisible, contextMenu, midPoint, edge]
  );

  return (
    <group position={[0, 0, active ? 1 : 0]}>
      {isSelfLoop && selfLoopCurve ? (
        <SelfLoop
          id={id}
          curve={selfLoopCurve}
          size={size}
          animated={animated}
          color={
            isSelected || active || isActive
              ? theme.edge.activeFill
              : fill || theme.edge.fill
          }
          opacity={selectionOpacity}
          onClick={event => {
            if (!disabled) {
              onClick?.(edge, event);
            }
          }}
          onContextMenu={() => {
            if (!disabled) {
              setMenuVisible(true);
              onContextMenu?.(edge);
            }
          }}
          onPointerOver={pointerOver}
          onPointerOut={pointerOut}
        />
      ) : (
        <Line
          curveOffset={curveOffset}
          animated={animated}
          color={
            isSelected || active || isActive
              ? theme.edge.activeFill
              : fill || theme.edge.fill
          }
          curve={curve}
          curved={curved}
          dashed={dashed}
          dashArray={dashArray}
          id={id}
          opacity={selectionOpacity}
          size={size}
          onClick={event => {
            if (!disabled) {
              onClick?.(edge, event);
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
      )}
      {arrowComponent}
      {labelComponent}
      {menuComponent}
    </group>
  );
};
