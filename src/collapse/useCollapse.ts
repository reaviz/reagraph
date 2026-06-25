import { useCallback, useMemo } from 'react';

import type { GraphEdge, GraphNode } from '../types';
import { getExpandPath, getVisibleEntities } from './utils';

export interface UseCollapseProps {
  /**
   * Current collapsed node ids.
   *
   * @default []
   */
  collapsedNodeIds?: string[];

  /**
   * Node data.
   *
   * @default []
   */
  nodes?: GraphNode[];

  /**
   * Edge data.
   *
   * @default []
   */
  edges?: GraphEdge[];
}

export interface CollpaseResult {
  /**
   * Determine if a node is currently collapsed
   */
  getIsCollapsed: (nodeId: string) => boolean;

  /**
   * Return a list of ids required to expand in order to view the provided node
   */
  getExpandPathIds: (nodeId: string) => string[];
}

export const useCollapse = ({
  collapsedNodeIds = [],
  nodes = [],
  edges = []
}: UseCollapseProps): CollpaseResult => {
  // Compute visibility once per input change instead of on every call —
  // getIsCollapsed is typically invoked per node, and each call previously
  // re-derived the entire visible set (rebuilding the traversal graph).
  const { visibleNodes, visibleEdges } = useMemo(
    () =>
      getVisibleEntities({
        nodes,
        edges,
        collapsedIds: collapsedNodeIds
      }),
    [collapsedNodeIds, edges, nodes]
  );

  const visibleNodeIds = useMemo(
    () => new Set(visibleNodes.map(n => n.id)),
    [visibleNodes]
  );

  const getIsCollapsed = useCallback(
    (nodeId: string) => !visibleNodeIds.has(nodeId),
    [visibleNodeIds]
  );

  const getExpandPathIds = useCallback(
    (nodeId: string) => {
      const visibleEdgeIds = visibleEdges.map(e => e.id);

      return getExpandPath({ nodeId, edges, visibleEdgeIds });
    },
    [visibleEdges, edges]
  );

  return {
    getIsCollapsed,
    getExpandPathIds
  };
};
