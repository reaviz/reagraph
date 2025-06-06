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
import { Edge as UnifiedEdge } from '../Edge';
import { Edge as BatchedLabelEdge } from './Edge';

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
 * Optimized edge rendering that balances performance and animation quality.
 *
 * Performance Strategy:
 * - Uses batched mesh rendering for most edges (high performance)
 * - Promotes edges to individual components only when needed for smooth animations
 * - Maintains visual consistency by respecting global animation settings
 *
 * Edge Promotion Logic:
 * - When animated=false: All edges use batched rendering
 * - When animated=true: Edges connected to selected/active/dragging nodes get individual rendering
 *
 * This provides the best of both worlds:
 * - High performance for large graphs (batched rendering)
 * - Smooth animations where they matter most (promoted edges)
 * - Visual consistency (no jarring mixed animation states)
 */
export const Edges: FC<EdgesProps> = ({
  interpolation = 'linear',
  arrowPlacement = 'end',
  labelPlacement = 'inline',
  animated = true,
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

  // Determine which edges need individual rendering for animations
  const [batchedEdges, promotedEdges] = useMemo(() => {
    if (!animated) {
      // When animation is disabled, batch all edges for maximum performance
      return [edges, []];
    }

    // When animated, promote edges that need smooth animations
    const selectedOrActiveNodes = new Set([...selections, ...actives]);
    const draggingNodes = new Set(draggingIds);

    const promoted: Array<InternalGraphEdge> = [];
    const batched: Array<InternalGraphEdge> = [];

    edges.forEach(edge => {
      // Promote edges if they're connected to selected, active, or dragging nodes
      const needsPromotion =
        selectedOrActiveNodes.has(edge.source) ||
        selectedOrActiveNodes.has(edge.target) ||
        draggingNodes.has(edge.source) ||
        draggingNodes.has(edge.target) ||
        selections.includes(edge.id) ||
        actives.includes(edge.id);

      if (needsPromotion) {
        promoted.push(edge);
      } else {
        batched.push(edge);
      }
    });

    return [batched, promoted];
  }, [edges, animated, selections, actives, draggingIds]);

  // Legacy grouping for batched edges (still needed for the batched mesh rendering)
  const [active, inactive, draggingActive, draggingInactive] = useMemo(() => {
    const active: Array<InternalGraphEdge> = [];
    const inactive: Array<InternalGraphEdge> = [];
    const draggingActive: Array<InternalGraphEdge> = [];
    const draggingInactive: Array<InternalGraphEdge> = [];

    batchedEdges.forEach(edge => {
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
  }, [batchedEdges, actives, selections, draggingIds]);

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
      // Only create meshes for batched edges to avoid duplicating promoted edges
      const edgeGeometries = getGeometries(batchedEdges);
      const edgeMeshes = edgeGeometries.map(edge => new Mesh(edge));
      setEdgeMeshes(edgeMeshes);
    }
  }, [getGeometries, setEdgeMeshes, batchedEdges, draggingIds.length]);

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
        intersection => batchedEdges[edgeMeshes.indexOf(intersection.object)]
      );
    },
    [edgeMeshes, batchedEdges]
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
      {/* Render promoted edges as individual components for smooth animations */}
      {promotedEdges.map(edge => (
        <UnifiedEdge
          key={edge.id}
          id={edge.id}
          animated={animated}
          disabled={disabled}
          labelFontUrl={labelFontUrl}
          labelPlacement={labelPlacement}
          arrowPlacement={arrowPlacement}
          interpolation={interpolation}
          contextMenu={contextMenu}
          onClick={onClick}
          onContextMenu={onContextMenu}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
        />
      ))}
      {/* Render labels only for batched edges (geometry is handled by batched meshes above) */}
      {batchedEdges.map(edge => (
        <BatchedLabelEdge
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
