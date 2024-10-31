import React, { FC, useCallback, useEffect, useMemo, useRef } from 'react';
import { a } from '@react-spring/three';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, Mesh, Raycaster, TubeGeometry } from 'three';

import { useStore } from '../../store';
import { ContextMenuEvent, InternalGraphEdge } from '../../types';
import { EdgeArrowPosition } from '../Arrow';
import { EdgeLabelPosition, EdgeInterpolation } from '../Edge';
import { useEdgeGeometry } from './useEdgeGeometry';
import { EdgeEvents, useEdgeEvents } from './useEdgeEvents';
import {
  useEdgePositionAnimation,
  useEdgeOpacityAnimation
} from './useEdgeAnimations';
import { Edge } from './Edge';

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
        if (selections.includes(edge.id) || actives.includes(edge.id)) {
          draggingActive.push(edge);
        } else {
          draggingInactive.push(edge);
        }
        return;
      }

      if (selections.includes(edge.id) || actives.includes(edge.id)) {
        active.push(edge);
      } else {
        inactive.push(edge);
      }
    });
    return [active, inactive, draggingActive, draggingInactive];
  }, [edges, actives, selections, draggingIds]);

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

    if (intersecting.join() !== previousIntersecting.join()) {
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
      {edges.map(edge => (
        <Edge
          animated={animated}
          contextMenu={contextMenu}
          color={theme.edge.label.color}
          disabled={disabled}
          edge={edge}
          key={edge.id}
          labelFontUrl={labelFontUrl}
          labelPlacement={labelPlacement}
        />
      ))}
    </group>
  );
};
