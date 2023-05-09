import { useCallback, useRef } from 'react';

import { useStore } from '../../store';
import { InternalGraphEdge } from '../../types';

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
  const { onClick, onContextMenu, onPointerOut, onPointerOver } = events;

  const edgeContextMenus = useStore(state => state.edgeContextMenus);
  const setEdgeContextMenus = useStore(state => state.setEdgeContextMenus);

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
      if (onClick && clickRef.current) {
        clickRef.current = false;
        if (!disabled) {
          intersected.forEach(edge => {
            onClick(edge);
          });
        }
      }

      if ((contextMenu || onContextMenu) && contextMenuEventRef.current) {
        contextMenuEventRef.current = false;
        if (!disabled) {
          intersected.forEach(edge => {
            if (!edgeContextMenus.has(edge.id)) {
              setEdgeContextMenus(new Set([...edgeContextMenus, edge.id]));
              onContextMenu?.(edge);
            }
          });
        }
      }

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
      onClick,
      onContextMenu,
      onPointerOver,
      onPointerOut
    ]
  );

  return {
    handleClick,
    handleContextMenu,
    handleIntersections
  };
}
