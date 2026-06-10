import { a } from '@react-spring/three';
import { useFrame } from '@react-three/fiber';
import type { FC } from 'react';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Raycaster, TubeGeometry } from 'three';
import { DoubleSide, Mesh } from 'three';

import { useStore } from '../../store';
import type { ContextMenuEvent, InternalGraphEdge } from '../../types';
import type { EdgeArrowPosition } from '../Arrow';
import type { EdgeInterpolation, EdgeLabelPosition } from '../Edge';
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

  // O(1) membership lookups, built once and reused by both the active/inactive
  // grouping below and the per-edge render pass — instead of scanning these
  // arrays for every edge (was O(e * (s + a + h))).
  const edgeStateSets = useMemo(
    () => ({
      selectionSet: new Set(selections),
      activeSet: new Set(actives),
      hoveredSet: new Set(hoveredEdgeIds)
    }),
    [selections, actives, hoveredEdgeIds]
  );

  const [active, inactive, draggingActive, draggingInactive] = useMemo(() => {
    const active: Array<InternalGraphEdge> = [];
    const inactive: Array<InternalGraphEdge> = [];
    const draggingActive: Array<InternalGraphEdge> = [];
    const draggingInactive: Array<InternalGraphEdge> = [];

    const { selectionSet, activeSet, hoveredSet } = edgeStateSets;
    const draggingSet = new Set(draggingIds);

    edges.forEach(edge => {
      const isActive =
        selectionSet.has(edge.id) ||
        activeSet.has(edge.id) ||
        hoveredSet.has(edge.id);
      if (draggingSet.has(edge.source) || draggingSet.has(edge.target)) {
        if (isActive) {
          draggingActive.push(edge);
        } else {
          draggingInactive.push(edge);
        }
        return;
      }

      if (isActive) {
        active.push(edge);
      } else {
        inactive.push(edge);
      }
    });
    return [active, inactive, draggingActive, draggingInactive];
  }, [edges, draggingIds, edgeStateSets]);

  const hasSelections = !!selections.length;

  const staticEdgesGeometry = useMemo(
    () => getGeometry(active, inactive),
    [getGeometry, active, inactive]
  );

  const { activeOpacity, inactiveOpacity } = useEdgeOpacityAnimation(
    animated,
    hasSelections,
    theme
  );

  useEdgePositionAnimation(staticEdgesGeometry, animated);

  useEffect(() => {
    if (draggingIds.length === 0) {
      const edgeGeometries = getGeometries(edges);
      const edgeMeshes = edgeGeometries.map(edge => new Mesh(edge));
      setEdgeMeshes(edgeMeshes);
    }
  }, [getGeometries, setEdgeMeshes, edges, draggingIds.length]);

  const staticEdgesRef = useRef(new Mesh());
  const dynamicEdgesRef = useRef(new Mesh());

  // O(1) mesh -> edge lookup so resolving raycaster hits doesn't scan the
  // entire edge mesh array (was O(e) per intersection, every frame).
  const meshToEdge = useMemo(() => {
    const map = new Map<Mesh, InternalGraphEdge>();
    for (let i = 0; i < edgeMeshes.length; i++) {
      map.set(edgeMeshes[i], edges[i]);
    }
    return map;
  }, [edgeMeshes, edges]);

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
      // Resolve hits to edges, dropping any that don't map (defensive: keeps
      // undefined out of the hovered set, event handlers and getGeometry).
      const hits: Array<InternalGraphEdge> = [];
      for (const intersection of intersections) {
        const edge = meshToEdge.get(intersection.object);
        if (edge) {
          hits.push(edge);
        }
      }
      return hits;
    },
    [edgeMeshes, meshToEdge]
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

  useFrame(state => {
    staticEdgesRef.current.geometry = staticEdgesGeometry;

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

    const previousIntersecting = intersectingRef.current;
    const intersecting = intersect(state.raycaster);
    handleIntersections(previousIntersecting, intersecting);

    // Compare the hovered set by edge id rather than Array.join() (which
    // stringified edge objects to "[object Object]" and only effectively
    // compared count). Comparing by id (not object identity) avoids needless
    // geometry rebuilds when the edges array is replaced with new objects for
    // the same logical edges, and tolerates undefined entries.
    let changed = intersecting.length !== previousIntersecting.length;
    if (!changed) {
      for (let i = 0; i < intersecting.length; i++) {
        if (intersecting[i]?.id !== previousIntersecting[i]?.id) {
          changed = true;
          break;
        }
      }
    }
    if (changed) {
      dynamicEdgesRef.current.geometry = getGeometry(intersecting, []);
    }

    intersectingRef.current = intersecting;
  });

  return (
    <group onClick={handleClick} onContextMenu={handleContextMenu}>
      {/* Static edges */}
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
      {/* Dynamic edges */}
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
      {edges.map(edge => {
        const isSelected = edgeStateSets.selectionSet.has(edge.id);
        const isActive = edgeStateSets.activeSet.has(edge.id);
        const isHovered = edgeStateSets.hoveredSet.has(edge.id);

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
            active={isSelected || isActive || isHovered}
          />
        );
      })}
    </group>
  );
};
