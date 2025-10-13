import { useCallback, useEffect, useRef } from 'react';

import { useStore } from '../../store';
import type { InternalGraphEdge } from '../../types';

export type EdgeEvents = {
  onClick?: (edge: InternalGraphEdge) => void;
  onContextMenu?: (edge?: InternalGraphEdge) => void;
  onPointerOver?: (edge: InternalGraphEdge) => void;
  onPointerOut?: (edge: InternalGraphEdge) => void;
};

export function useEdgeEvents(
  events: EdgeEvents,
  contextMenu,
  disabled: boolean
) {
  const memoizedEvents = useRef(events);
  useEffect(() => {
    memoizedEvents.current = events;
  }, [events]);

  const edgeContextMenus = useStore(state => state.edgeContextMenus);
  const setEdgeContextMenus = useStore(
    useCallback(state => state.setEdgeContextMenus, [])
  );
  const setHoveredEdgeIds = useStore(
    useCallback(state => state.setHoveredEdgeIds, [])
  );

  const clickRef = useRef(false);
  const handleClick = useCallback(() => {
    clickRef.current = true;
  }, []);

  const contextMenuEventRef = useRef(false);
  const handleContextMenu = useCallback(() => {
    contextMenuEventRef.current = true;
  }, []);

  const handleIntersections = useCallback(
    (
      previous: Array<InternalGraphEdge>,
      intersected: Array<InternalGraphEdge>
    ) => {
      const { onClick, onContextMenu, onPointerOver, onPointerOut } =
        memoizedEvents.current;

      if (onClick && clickRef.current && !disabled) {
        clickRef.current = false;
        for (const edge of intersected) {
          onClick(edge);
        }
      }

      if (
        (contextMenu || onContextMenu) &&
        contextMenuEventRef.current &&
        !disabled
      ) {
        contextMenuEventRef.current = false;
        const newEdges = new Set(edgeContextMenus);
        let hasChanges = false;

        for (const edge of intersected) {
          if (!edgeContextMenus.has(edge.id)) {
            newEdges.add(edge.id);
            hasChanges = true;
            onContextMenu?.(edge);
          }
        }

        if (hasChanges) {
          setEdgeContextMenus(newEdges);
        }
      }

      const hoveredIds =
        intersected.length > 0 ? intersected.map(edge => edge.id) : [];
      setHoveredEdgeIds(hoveredIds);

      if (onPointerOver) {
        const over = intersected.filter(index => !previous.includes(index));
        over.forEach(edge => {
          onPointerOver(edge);
        });
      }

      if (onPointerOut) {
        const out = previous.filter(index => !intersected.includes(index));
        out.forEach(edge => {
          onPointerOut(edge);
        });
      }
    },
    [
      contextMenu,
      disabled,
      edgeContextMenus,
      setEdgeContextMenus,
      setHoveredEdgeIds
    ]
  );

  return {
    handleClick,
    handleContextMenu,
    handleIntersections
  };
}
