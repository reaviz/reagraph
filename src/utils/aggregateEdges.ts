import { InternalGraphEdge } from '../types';
import Graph from 'graphology';

/**
 * Graphology-native approach using reduceEdges for optimal performance
 * @param graph Graphology graph instance
 * @returns Map with source-target pairs as keys and arrays of edges as values
 */
export const groupEdgesBySourceTarget = (
  graph: Graph
): Map<string, InternalGraphEdge[]> => {
  // Use Graphology's native reduceEdges
  return graph.reduceEdges(
    (
      edgeGroups: Map<string, InternalGraphEdge[]>,
      edgeKey,
      attributes,
      source,
      target
    ) => {
      const key = `${source}-${target}`;

      // Construct complete InternalGraphEdge object
      const edge: InternalGraphEdge = {
        id: edgeKey,
        source,
        target,
        ...attributes
      };

      const group = edgeGroups.get(key);
      if (group) {
        group.push(edge);
      } else {
        edgeGroups.set(key, [edge]);
      }

      return edgeGroups;
    },
    new Map<string, InternalGraphEdge[]>()
  );
};

/**
 * Aggregates edges with the same source and target using Graphology's native functions
 * @param graph Graphology graph instance
 * @returns Array of aggregated edges
 */
export const aggregateEdges = (graph: Graph): InternalGraphEdge[] => {
  if (!graph || graph.size === 0) {
    return [];
  }

  // Use Graphology's native reduceEdges to group and aggregate in one pass
  const edgeGroups = groupEdgesBySourceTarget(graph);
  const aggregatedEdges: InternalGraphEdge[] = [];

  // Process groups efficiently
  for (const [key, group] of edgeGroups) {
    const [source, target] = key.split('-');
    const firstEdge = group[0];

    if (!source || !target || !firstEdge) {
      continue;
    }

    // Create an aggregated edge that represents the group
    const aggregatedEdge: InternalGraphEdge = {
      ...firstEdge,
      source,
      target,
      label: `${group.length} edges`,
      labelVisible: true,
      // Store the original edges in the data property
      data: {
        ...(firstEdge.data || {}),
        originalEdges: group,
        count: group.length,
        isAggregated: true
      }
    };

    aggregatedEdges.push(aggregatedEdge);
  }

  return aggregatedEdges;
};
