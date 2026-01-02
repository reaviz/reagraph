/**
 * Hook for handling events on instanced nodes.
 * Provides raycasting against InstancedMesh and event dispatching.
 */

import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import type { InstancedMesh } from 'three';
import { Vector2 } from 'three';

import { useStore } from '../../store';
import type {
  CollapseProps,
  ContextMenuEvent,
  InternalGraphNode,
  NodeContextMenuProps
} from '../../types';

/** Throttle interval for intersection testing (ms) */
const INTERSECT_THROTTLE_MS = 50;

export interface NodeEventHandlers {
  onClick?: (
    node: InternalGraphNode,
    props?: CollapseProps,
    event?: ThreeEvent<MouseEvent>
  ) => void;
  onDoubleClick?: (
    node: InternalGraphNode,
    event?: ThreeEvent<MouseEvent>
  ) => void;
  onContextMenu?: (
    node: InternalGraphNode,
    props?: NodeContextMenuProps
  ) => void;
  onPointerOver?: (
    node: InternalGraphNode,
    event?: ThreeEvent<PointerEvent>
  ) => void;
  onPointerOut?: (
    node: InternalGraphNode,
    event?: ThreeEvent<PointerEvent>
  ) => void;
}

export interface NodeEventsResult {
  /** Handler for click events (call from DOM event listener) */
  handleClick: (event: MouseEvent) => void;
  /** Handler for double-click events */
  handleDoubleClick: (event: MouseEvent) => void;
  /** Handler for context menu events */
  handleContextMenu: (event: MouseEvent) => void;
  /** Handler for pointer move events */
  handlePointerMove: (event: PointerEvent) => void;
  /** Currently hovered node ID (or null) */
  hoveredNodeId: string | null;
}

/**
 * Hook for handling events on instanced nodes.
 *
 * @param mesh - The InstancedMesh to raycast against
 * @param nodes - Array of nodes for lookup
 * @param indexToNodeId - Map from instance index to node ID
 * @param events - Event handler callbacks
 * @param contextMenu - Context menu render function
 * @param disabled - Whether interactions are disabled
 */
export function useNodeEvents(
  mesh: InstancedMesh | null,
  nodes: InternalGraphNode[],
  indexToNodeId: Map<number, string>,
  events: NodeEventHandlers,
  contextMenu: ((event: ContextMenuEvent) => ReactNode) | undefined,
  disabled: boolean
): NodeEventsResult {
  // Store events in ref to avoid stale closures
  const eventsRef = useRef(events);
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  // Store nodes in ref for lookup
  const nodesRef = useRef(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // Store indexToNodeId in ref
  const indexToNodeIdRef = useRef(indexToNodeId);
  useEffect(() => {
    indexToNodeIdRef.current = indexToNodeId;
  }, [indexToNodeId]);

  // Access Three.js context
  const { raycaster, camera, gl } = useThree();

  // Track hovered node
  const hoveredNodeIdRef = useRef<string | null>(null);
  const lastIntersectTimeRef = useRef(0);

  // Store for updating hovered state
  const setHoveredNodeIds = useStore(state => state.setHoveredNodeIds);
  const nodeContextMenus = useStore(state => state.nodeContextMenus);
  const setNodeContextMenus = useStore(state => state.setNodeContextMenus);

  // Store nodeContextMenus in ref to avoid stale closures in useFrame
  const nodeContextMenusRef = useRef(nodeContextMenus);
  useEffect(() => {
    nodeContextMenusRef.current = nodeContextMenus;
  }, [nodeContextMenus]);

  // Pending event flags
  const pendingClickRef = useRef<MouseEvent | null>(null);
  const pendingDoubleClickRef = useRef<MouseEvent | null>(null);
  const pendingContextMenuRef = useRef<MouseEvent | null>(null);

  // Normalized mouse position for raycasting
  const mouseRef = useRef(new Vector2());

  /**
   * Convert screen coordinates to normalized device coordinates.
   */
  const updateMousePosition = useCallback(
    (event: MouseEvent | PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    },
    [gl.domElement]
  );

  /**
   * Raycast against the instanced mesh and return intersected node.
   */
  const getIntersectedNode = useCallback((): InternalGraphNode | null => {
    if (!mesh || disabled) return null;

    raycaster.setFromCamera(mouseRef.current, camera);
    const intersects = raycaster.intersectObject(mesh);

    if (intersects.length === 0) return null;

    const intersection = intersects[0];
    const instanceId = intersection.instanceId;

    if (instanceId === undefined) return null;

    const nodeId = indexToNodeIdRef.current.get(instanceId);
    if (!nodeId) return null;

    return nodesRef.current.find(n => n.id === nodeId) ?? null;
  }, [mesh, disabled, raycaster, camera]);

  /**
   * Handle click event.
   */
  const handleClick = useCallback((event: MouseEvent) => {
    updateMousePosition(event);
    pendingClickRef.current = event;
  }, [updateMousePosition]);

  /**
   * Handle double-click event.
   */
  const handleDoubleClick = useCallback((event: MouseEvent) => {
    updateMousePosition(event);
    pendingDoubleClickRef.current = event;
  }, [updateMousePosition]);

  /**
   * Handle context menu event.
   */
  const handleContextMenu = useCallback((event: MouseEvent) => {
    updateMousePosition(event);
    pendingContextMenuRef.current = event;
  }, [updateMousePosition]);

  /**
   * Handle pointer move event.
   */
  const handlePointerMove = useCallback((event: PointerEvent) => {
    updateMousePosition(event);
  }, [updateMousePosition]);

  // Process events and intersection in useFrame (throttled)
  useFrame(() => {
    if (disabled || !mesh) return;

    const now = performance.now();

    // Process pending click
    if (pendingClickRef.current) {
      pendingClickRef.current = null;

      const node = getIntersectedNode();
      if (node && eventsRef.current.onClick) {
        // Note: CollapseProps would need to be computed from graph state
        // We pass undefined for event since we have a DOM event, not ThreeEvent
        eventsRef.current.onClick(node, undefined, undefined);
      }
    }

    // Process pending double-click
    if (pendingDoubleClickRef.current) {
      pendingDoubleClickRef.current = null;

      const node = getIntersectedNode();
      if (node && eventsRef.current.onDoubleClick) {
        // We pass undefined for event since we have a DOM event, not ThreeEvent
        eventsRef.current.onDoubleClick(node, undefined);
      }
    }

    // Process pending context menu
    if (pendingContextMenuRef.current) {
      pendingContextMenuRef.current = null;

      const node = getIntersectedNode();
      if (node && (contextMenu || eventsRef.current.onContextMenu)) {
        // Add to context menu state (use ref to avoid stale closure)
        const currentMenus = nodeContextMenusRef.current ?? new Set<string>();
        if (contextMenu && !currentMenus.has(node.id)) {
          const newMenus = new Set(currentMenus);
          newMenus.add(node.id);
          setNodeContextMenus(newMenus);
        }
        eventsRef.current.onContextMenu?.(node);
      }
    }

    // Throttle hover detection
    if (now - lastIntersectTimeRef.current < INTERSECT_THROTTLE_MS) {
      return;
    }
    lastIntersectTimeRef.current = now;

    // Check for hover changes
    const intersectedNode = getIntersectedNode();
    const currentHoveredId = intersectedNode?.id ?? null;
    const previousHoveredId = hoveredNodeIdRef.current;

    if (currentHoveredId !== previousHoveredId) {
      // Pointer out event
      if (previousHoveredId && eventsRef.current.onPointerOut) {
        const prevNode = nodesRef.current.find(n => n.id === previousHoveredId);
        if (prevNode) {
          eventsRef.current.onPointerOut(prevNode);
        }
      }

      // Pointer over event
      if (currentHoveredId && eventsRef.current.onPointerOver) {
        eventsRef.current.onPointerOver(intersectedNode!);
      }

      // Update hovered state
      hoveredNodeIdRef.current = currentHoveredId;
      setHoveredNodeIds?.(currentHoveredId ? [currentHoveredId] : []);
    }
  });

  return {
    handleClick,
    handleDoubleClick,
    handleContextMenu,
    handlePointerMove,
    hoveredNodeId: hoveredNodeIdRef.current
  };
}

/**
 * Create a map from instance index to node ID for efficient reverse lookups.
 *
 * @param nodeIdToIndex - Map from node ID to instance index
 * @returns Map from instance index to node ID
 */
export function createIndexToNodeIdMap(
  nodeIdToIndex: Map<string, number>
): Map<number, string> {
  const indexToNodeId = new Map<number, string>();
  for (const [nodeId, index] of nodeIdToIndex.entries()) {
    indexToNodeId.set(index, nodeId);
  }
  return indexToNodeId;
}
