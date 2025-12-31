import { a, useSpring } from '@react-spring/three';
import { Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import type { FC } from 'react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import type { ColorRepresentation } from 'three';
import { Euler, Vector3 } from 'three';

import { useStore } from '../../store';
import type { ContextMenuEvent, InternalGraphEdge } from '../../types';
import {
  animationConfig,
  calculateSubLabelOffset,
  getCurve,
  getLabelOffsetByType,
  getMidPoint,
  getVector
} from '../../utils';
import type {
  EdgeLabelPosition,
  EdgeSubLabelPosition
} from '../Edge';
import { Label } from '../Label';

// Re-export EdgeArrowPosition for internal use (not exported from index to avoid conflicts)
export type EdgeArrowPosition = 'none' | 'mid' | 'end';

export interface EdgeProps {
  /**
   * Whether the edge should be animated.
   */
  animated?: boolean;

  /**
   * Whether the edge should be disabled.
   */
  disabled?: boolean;

  /**
   * The color of the edge.
   */
  color: ColorRepresentation;

  /**
   * A function that returns the context menu for the edge.
   */
  contextMenu?: (event: Partial<ContextMenuEvent>) => React.ReactNode;

  /**
   * The edge object.
   */
  edge: InternalGraphEdge;

  /**
   * The URL of the font for the edge label.
   */
  labelFontUrl?: string;

  /**
   * The placement of the edge label.
   */
  labelPlacement?: EdgeLabelPosition;

  /**
   * The placement of the edge subLabel relative to the main label.
   */
  subLabelPlacement?: EdgeSubLabelPosition;

  /**
   * The opacity of the edge.
   */
  opacity?: number;

  /**
   * Whether the edge is active.
   */
  active?: boolean;

  /**
   * Whether the edge is curved.
   */
  curved?: boolean;

  /**
   * The curve offset for multi-edge handling.
   */
  curveOffset?: number;
}

const LABEL_PLACEMENT_OFFSET = 3;

// LOD: Maximum camera distance at which edge labels are visible
// At distances greater than this, labels would be too small to read anyway
// This significantly improves performance when zoomed out on large graphs
// For large graphs (1000+ nodes), default view can be 25000+ units away
// This threshold allows labels to appear after moderate zooming
const LABEL_VISIBILITY_DISTANCE = 15000;

export const Edge: FC<EdgeProps> = ({
  animated,
  color,
  contextMenu,
  edge,
  labelFontUrl,
  labelPlacement = 'inline',
  subLabelPlacement = 'below',
  opacity,
  active,
  curved = false,
  curveOffset
}) => {
  const theme = useStore(state => state.theme);
  const {
    target,
    source,
    label,
    subLabel,
    labelVisible = false,
    size = 1
  } = edge;

  // Use edge-specific subLabelPlacement if available, otherwise use prop value
  const effectiveSubLabelPlacement = edge.subLabelPlacement || subLabelPlacement;

  const nodes = useStore(store => store.nodes);
  const [from, to] = useMemo(
    () => [
      nodes.find(node => node.id === source),
      nodes.find(node => node.id === target)
    ],
    [nodes, source, target]
  );
  const isDragging = useStore(state => state.draggingIds.length > 0);

  // LOD: Track whether label should be visible based on camera distance
  const [isLabelInRange, setIsLabelInRange] = useState(true);
  const wasInRangeRef = useRef(true);
  const lastUpdateTimeRef = useRef(0);
  const pendingUpdateRef = useRef<boolean | null>(null);
  const { camera } = useThree();

  // Check camera distance and update label visibility
  // Debounced to prevent staggering during fast zoom with mouse wheel
  const LOD_UPDATE_DEBOUNCE_MS = 150;

  useFrame(() => {
    if (!label || !from || !to) return;

    // Calculate distance from camera to edge midpoint
    const edgeMidX = (from.position.x + to.position.x) / 2;
    const edgeMidY = (from.position.y + to.position.y) / 2;
    const edgeMidZ = ((from.position.z || 0) + (to.position.z || 0)) / 2;

    const dx = camera.position.x - edgeMidX;
    const dy = camera.position.y - edgeMidY;
    const dz = camera.position.z - edgeMidZ;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // Account for camera zoom (orthographic cameras use zoom instead of position)
    const zoom = 'zoom' in camera ? (camera as any).zoom : 1;
    const effectiveDistance = distance / zoom;

    const isInRange = effectiveDistance < LABEL_VISIBILITY_DISTANCE;

    // Only update state when visibility changes, with debouncing
    if (isInRange !== wasInRangeRef.current) {
      const now = performance.now();
      pendingUpdateRef.current = isInRange;

      // Debounce: only apply the update after the debounce period
      if (now - lastUpdateTimeRef.current >= LOD_UPDATE_DEBOUNCE_MS) {
        wasInRangeRef.current = isInRange;
        setIsLabelInRange(isInRange);
        lastUpdateTimeRef.current = now;
        pendingUpdateRef.current = null;
      }
    } else if (pendingUpdateRef.current !== null) {
      // Apply any pending update after debounce period
      const now = performance.now();
      if (now - lastUpdateTimeRef.current >= LOD_UPDATE_DEBOUNCE_MS) {
        wasInRangeRef.current = pendingUpdateRef.current;
        setIsLabelInRange(pendingUpdateRef.current);
        lastUpdateTimeRef.current = now;
        pendingUpdateRef.current = null;
      }
    }
  });

  const labelOffset = useMemo(
    () => (size + theme.edge.label.fontSize) / 2,
    [size, theme.edge.label.fontSize]
  );

  // Calculate curve for curved edges to adjust label position
  const curve = useMemo(() => {
    if (!curved || !from || !to) return null;
    const fromVector = getVector(from);
    const toVector = getVector(to);
    return getCurve(fromVector, from.size, toVector, to.size, true, curveOffset);
  }, [curved, from, to, curveOffset]);

  const midPoint = useMemo(() => {
    if (!from || !to) return new Vector3(0, 0, 0);

    let newMidPoint = getMidPoint(
      from.position,
      to.position,
      getLabelOffsetByType(labelOffset, labelPlacement)
    );

    // Adjust label position for curved edges
    if (curved && curve) {
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
  }, [from, to, labelOffset, labelPlacement, curved, curve]);

  // Calculate subLabel offset
  const subLabelOffset = useMemo(() => {
    if (!from || !to) return { x: 0, y: 0, z: 0 };
    return calculateSubLabelOffset(
      from.position,
      to.position,
      effectiveSubLabelPlacement
    );
  }, [from, to, effectiveSubLabelPlacement]);

  const edgeContextMenus = useStore(state => state.edgeContextMenus);
  const setEdgeContextMenus = useStore(state => state.setEdgeContextMenus);

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
        duration: animated && !isDragging ? undefined : 0
      }
    }),
    [midPoint, animated, isDragging]
  );

  const removeContextMenu = useCallback(
    (edgeId: string) => {
      const newEdgeContextMenus = new Set(edgeContextMenus);
      newEdgeContextMenus.delete(edgeId);
      setEdgeContextMenus(newEdgeContextMenus);
    },
    [edgeContextMenus, setEdgeContextMenus]
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

  const htmlProps = useMemo(
    () => ({
      prepend: true,
      center: true,
      position: midPoint
    }),
    [midPoint]
  );

  const labelProps = useMemo(
    () => ({
      text: label,
      ellipsis: 15,
      fontUrl: labelFontUrl,
      stroke: theme.edge.label.stroke,
      color,
      opacity,
      fontSize: theme.edge.label.fontSize,
      rotation: labelRotation,
      active
    }),
    [
      label,
      labelFontUrl,
      theme.edge.label.stroke,
      color,
      opacity,
      theme.edge.label.fontSize,
      labelRotation,
      active
    ]
  );

  // LOD: Only render label when camera is close enough AND labelVisible is true
  const shouldShowLabel = labelVisible && label && isLabelInRange;

  return (
    <group>
      {shouldShowLabel && (
        <a.group position={labelPosition as any}>
          <Label {...labelProps} />

          {subLabel && (
            <group position={[subLabelOffset.x, subLabelOffset.y, 0]}>
              <Label
                text={subLabel}
                ellipsis={15}
                fontUrl={labelFontUrl}
                stroke={theme.edge.subLabel?.stroke || theme.edge.label.stroke}
                active={active}
                color={
                  active
                    ? theme.edge.subLabel?.activeColor ||
                      theme.edge.label.activeColor
                    : theme.edge.subLabel?.color || theme.edge.label.color
                }
                opacity={opacity}
                fontSize={
                  theme.edge.subLabel?.fontSize ||
                  theme.edge.label.fontSize * 0.8
                }
                rotation={labelRotation}
              />
            </group>
          )}
        </a.group>
      )}
      {contextMenu && edgeContextMenus.has(edge.id) && (
        <Html {...htmlProps}>
          {contextMenu({
            data: edge,
            onClose: () => removeContextMenu(edge.id)
          })}
        </Html>
      )}
    </group>
  );
};
