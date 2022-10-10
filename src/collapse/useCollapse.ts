import React, { useCallback } from 'react';
import { GraphEdge, GraphNode } from 'types';
import { getExpandPath, getVisibleEntities } from './utils';

export interface UseCollapseProps {
  /**
   * Current collapsed node ids.
   */
  collapsedNodeIds?: string[];

  /**
   * Node data.
   */
  nodes?: GraphNode[];

  /**
   * Edge data.
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
  const getIsCollapsed = useCallback(
    (nodeId: string) => {
      const { visibleNodes } = getVisibleEntities({
        nodes,
        edges,
        collapsedIds: collapsedNodeIds
      });
      const visibleNodeIds = visibleNodes.map(n => n.id);

      return !visibleNodeIds.includes(nodeId);
    },
    [collapsedNodeIds, edges, nodes]
  );

  const getExpandPathIds = useCallback(
    (nodeId: string) => {
      const { visibleEdges } = getVisibleEntities({
        nodes,
        edges,
        collapsedIds: collapsedNodeIds
      });
      const visibleEdgeIds = visibleEdges.map(e => e.id);

      return getExpandPath({ nodeId, edges, visibleEdgeIds });
    },
    [collapsedNodeIds, edges, nodes]
  );

  return {
    getIsCollapsed,
    getExpandPathIds
  };
};
