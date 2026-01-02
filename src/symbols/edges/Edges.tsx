import { a } from '@react-spring/three';
import { useFrame } from '@react-three/fiber';
import type { FC } from 'react';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Raycaster, TubeGeometry } from 'three';
import { DoubleSide, Mesh } from 'three';

import { useStore } from '../../store';
import type { ContextMenuEvent, InternalGraphEdge } from '../../types';
import { calculateEdgeCurveOffset } from '../../utils';
import type { EdgeArrowPosition } from '../Arrow';
import type {
  EdgeInterpolation,
  EdgeLabelPosition,
  EdgeSubLabelPosition
} from '../Edge';
import { Edge } from './Edge';
import {
  useEdgeOpacityAnimation,
  useEdgePositionAnimation
} from './useEdgeAnimations';
import type { EdgeEvents } from './useEdgeEvents';
import { useEdgeEvents } from './useEdgeEvents';
import { useEdgeGeometry } from './useEdgeGeometry';

export type EdgesProps = {
  /**
   * Whether the edge should be animated.
   */
  animated?: boolean;

  /**
   * The placement of the edge arrow.
   */
  arrowPlacement?: EdgeArrowPosition;

  /**
   * A function that returns the context menu for the edge.
   */
  contextMenu?: (event: Partial<ContextMenuEvent>) => React.ReactNode;

  /**
   * Whether the edge should be disabled.
   */
  disabled?: boolean;

  /**
   * The array of edge objects.
   */
  edges: Array<InternalGraphEdge>;

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
   * The type of interpolation used to draw the edge.
   */
  interpolation?: EdgeInterpolation;
} & EdgeEvents;

/**
 * Three.js rendering starts to get slower if you have an individual mesh for each edge
 * and a high number of edges.
 *
 * Instead, we take the edges and split them into their different render states:
 *
 *  * - Active (any edges that are marked as "selected" or "active" in the state)
 *  * - Dragging (any edges that are connected to a node that is being dragged)
 *  * - Intersecting (any edges that are currently intersected by the ray from the mouse position)
 *  * - Inactive (any edges that aren't active, dragging, or intersected)
 *
 * We generate the geometry for each edge in each of these groups, and then merge them
 * into a single geometry for each group. This merged mesh is rendered as one object
 * which gives much better performance. This means that we only need to update geometry
 * and positions when edges move between the different states, rather than updating all
 * edges whenever any other edge changes.
 *
 * To get this all working, we have to do a few things outside the @react-three/fiber world,
 * specifically:
 *
 *  * manually create edge/arrow geometries (see `useEdgeGeometry`)
 *  * manually track mouse/edge interactions and fire events (see `useEdgeEvents`)
 *  * manually update edge/arrow positions during aniamations (see `useEdgeAnimations`)
 */
export const Edges: FC<EdgesProps> = ({
  interpolation = 'linear',
  arrowPlacement = 'end',
  labelPlacement = 'inline',
  subLabelPlacement = 'below',
  animated,
  contextMenu,
  disabled,
  edges,
  labelFontUrl,
  onClick,
  onContextMenu,
  onPointerOut,
  onPointerOver
}) => {
  const theme = useStore(state => state.theme);
  const nodes = useStore(state => state.nodes);
  const { getGeometries, getGeometry } = useEdgeGeometry(
    arrowPlacement,
    interpolation
  );

  const draggingIds = useStore(state => state.draggingIds);
  const edgeMeshes = useStore(state => state.edgeMeshes);
  const setEdgeMeshes = useStore(state => state.setEdgeMeshes);
  const actives = useStore(state => state.actives || []);
  const selections = useStore(state => state.selections || []);
  const hoveredEdgeIds = useStore(state => state.hoveredEdgeIds || []);

  const [active, inactive, draggingActive, draggingInactive] = useMemo(() => {
    const active: Array<InternalGraphEdge> = [];
    const inactive: Array<InternalGraphEdge> = [];
    const draggingActive: Array<InternalGraphEdge> = [];
    const draggingInactive: Array<InternalGraphEdge> = [];
    edges.forEach(edge => {
      if (
        draggingIds.includes(edge.source) ||
        draggingIds.includes(edge.target)
      ) {
        if (
          selections.includes(edge.id) ||
          actives.includes(edge.id) ||
          hoveredEdgeIds.includes(edge.id)
        ) {
          draggingActive.push(edge);
        } else {
          draggingInactive.push(edge);
        }
        return;
      }

      if (
        selections.includes(edge.id) ||
        actives.includes(edge.id) ||
        hoveredEdgeIds.includes(edge.id)
      ) {
        active.push(edge);
      } else {
        inactive.push(edge);
      }
    });
    return [active, inactive, draggingActive, draggingInactive];
  }, [edges, actives, selections, draggingIds, hoveredEdgeIds]);

  const hasSelections = !!selections.length;
  const edgeContextMenus = useStore(state => state.edgeContextMenus);

  // Performance: Pre-filter edges that need Label components (only ~30% typically have visible labels)
  const edgesNeedingLabels = useMemo(
    () => edges.filter(edge => (edge.labelVisible && edge.label) || edgeContextMenus.has(edge.id)),
    [edges, edgeContextMenus]
  );

  // Performance: Pre-compute curve offsets for all labeled edges in a single pass
  // This avoids O(n*m) complexity from calling calculateEdgeCurveOffset per-edge
  const curveOffsetMap = useMemo(() => {
    const map = new Map<string, { curved: boolean; curveOffset: number | undefined }>();

    edgesNeedingLabels.forEach(edge => {
      const edgeInterpolation = edge.interpolation || interpolation;
      const { curved, curveOffset } = calculateEdgeCurveOffset({
        edge,
        edges,
        curved: edgeInterpolation === 'curved'
      });
      map.set(edge.id, { curved, curveOffset });
    });

    return map;
  }, [edgesNeedingLabels, edges, interpolation]);

  // Recalculate geometry when nodes move (for animation) or edge groups change
  const staticEdgesGeometry = useMemo(
    () => getGeometry(active, inactive),
    [getGeometry, active, inactive, nodes]
  );

  const { activeOpacity, inactiveOpacity, scale } = useEdgeOpacityAnimation(
    animated,
    hasSelections,
    theme
  );

  useEffect(() => {
    if (draggingIds.length === 0) {
      const edgeGeometries = getGeometries(edges);
      const edgeMeshes = edgeGeometries.map(edge => new Mesh(edge));
      setEdgeMeshes(edgeMeshes);
    }
  }, [getGeometries, setEdgeMeshes, edges, draggingIds.length]);

  const staticEdgesRef = useRef(new Mesh());
  const dynamicEdgesRef = useRef(new Mesh());

  const intersect = useCallback(
    (raycaster: Raycaster): Array<InternalGraphEdge> => {
      // Handle initial raycaster state:
      if (!raycaster.camera) {
        return [];
      }
      const intersections =
        raycaster.intersectObjects<Mesh<TubeGeometry>>(edgeMeshes);
      if (!intersections.length) {
        return [];
      }
      return intersections.map(
        intersection => edges[edgeMeshes.indexOf(intersection.object)]
      );
    },
    [edgeMeshes, edges]
  );

  const { handleClick, handleContextMenu, handleIntersections } = useEdgeEvents(
    {
      onClick,
      onContextMenu,
      onPointerOut,
      onPointerOver
    },
    contextMenu,
    disabled
  );

  const draggingIdRef = useRef<string[]>([]);
  const intersectingRef = useRef<Array<InternalGraphEdge>>([]);
  const lastIntersectTimeRef = useRef(0);
  const INTERSECT_THROTTLE_MS = 50; // Only check intersections every 50ms (20 times/sec max)

  // Pass the mesh ref to animation hook so it can update the actual rendered geometry
  useEdgePositionAnimation(
    staticEdgesRef,
    staticEdgesGeometry,
    animated
  );

  useFrame(state => {
    if (disabled) {
      return;
    }

    const previousDraggingId = draggingIdRef.current;
    if (
      draggingIds.length ||
      (draggingIds.length === 0 && previousDraggingId !== null)
    ) {
      dynamicEdgesRef.current.geometry = getGeometry(
        draggingActive,
        draggingInactive
      );
    }

    draggingIdRef.current = draggingIds;
    if (draggingIds.length) {
      return;
    }

    // Performance: Throttle intersection checks - raycasting against 2000+ meshes is expensive
    const now = performance.now();
    if (now - lastIntersectTimeRef.current < INTERSECT_THROTTLE_MS) {
      return;
    }
    lastIntersectTimeRef.current = now;

    const previousIntersecting = intersectingRef.current;
    const intersecting = intersect(state.raycaster);
    handleIntersections(previousIntersecting, intersecting);

    if (intersecting.join() !== previousIntersecting.join()) {
      dynamicEdgesRef.current.geometry = getGeometry(intersecting, []);
    }

    intersectingRef.current = intersecting;
  });

  return (
    <group onClick={handleClick} onContextMenu={handleContextMenu}>
      {/* Static edges - animated scale for "grow in" effect */}
      <a.group scale={scale}>
        <mesh ref={staticEdgesRef}>
          <a.meshBasicMaterial
            attach="material-0"
            depthTest={false}
            fog={true}
            opacity={inactiveOpacity}
            side={DoubleSide}
            transparent={true}
            vertexColors={true}
          />
          <a.meshBasicMaterial
            attach="material-1"
            color={theme.edge.activeFill}
            depthTest={false}
            fog={true}
            opacity={activeOpacity}
            side={DoubleSide}
            transparent={true}
          />
        </mesh>
      </a.group>
      {/* Dynamic edges - animated scale for "grow in" effect */}
      <a.group scale={scale}>
        <mesh ref={dynamicEdgesRef}>
          <a.meshBasicMaterial
            attach="material-0"
            color={theme.edge.fill}
            depthTest={false}
            fog={true}
            opacity={inactiveOpacity}
            side={DoubleSide}
            transparent={true}
          />
          <a.meshBasicMaterial
            attach="material-1"
            color={theme.edge.activeFill}
            depthTest={false}
            fog={true}
            opacity={activeOpacity}
            side={DoubleSide}
            transparent={true}
          />
        </mesh>
      </a.group>
      {/* Performance: Only render Edge components for edges that need labels or context menus */}
      {edgesNeedingLabels.map(edge => {
        const isSelected = selections.includes(edge.id);
        const isActive = actives.includes(edge.id);
        const isHovered = hoveredEdgeIds.includes(edge.id);

        // Use pre-computed curve offset from memoized map
        const curveData = curveOffsetMap.get(edge.id);

        return (
          <Edge
            animated={animated}
            contextMenu={contextMenu}
            color={
              isSelected || isActive || isHovered
                ? theme.edge.label.activeColor
                : theme.edge.label.color
            }
            disabled={disabled}
            edge={edge}
            key={edge.id}
            labelFontUrl={labelFontUrl}
            labelPlacement={labelPlacement}
            subLabelPlacement={subLabelPlacement}
            active={isSelected || isActive || isHovered}
            curved={curveData?.curved ?? false}
            curveOffset={curveData?.curveOffset}
          />
        );
      })}
    </group>
  );
};
