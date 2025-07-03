import { InternalGraphEdge } from '../types';

/**
 * Groups edges by their source and target nodes.
 * @param edges Array of edges to group
 * @returns Map with source-target pairs as keys and arrays of edges as values
 */
export const groupEdgesBySourceTarget = (
  edges: InternalGraphEdge[]
): Map<string, InternalGraphEdge[]> => {
  const edgeGroups = new Map<string, InternalGraphEdge[]>();

  // Filter out undefined edges
  const validEdges = edges.filter(edge => edge && edge.source && edge.target);

  validEdges.forEach(edge => {
    // Create a key that represents the source-target pair
    // We sort the source and target to ensure that edges in both directions are grouped separately
    const key = `${edge.source}-${edge.target}`;

    if (!edgeGroups.has(key)) {
      edgeGroups.set(key, []);
    }

    edgeGroups.get(key)!.push(edge);
  });

  return edgeGroups;
};

/**
 * Aggregates edges with the same source and target.
 * @param edges Array of edges to aggregate
 * @returns Array of aggregated edges
 */
export const aggregateEdges = (
  edges: InternalGraphEdge[]
): InternalGraphEdge[] => {
  if (!edges || edges.length === 0) {
    return [];
  }

  const edgeGroups = groupEdgesBySourceTarget(edges);
  const aggregatedEdges: InternalGraphEdge[] = [];

  edgeGroups.forEach((group, key) => {
    if (group.length === 1) {
      // If there's only one edge in the group, just add it as is
      aggregatedEdges.push(group[0]);
    } else {
      // If there are multiple edges, create an aggregated edge
      const [source, target] = key.split('-');
      const firstEdge = group[0];

      if (!source || !target || !firstEdge) {
        return; // Skip this group if we don't have valid source/target
      }

      // Create an aggregated edge that represents the group
      const aggregatedEdge: InternalGraphEdge = {
        ...firstEdge,
        source,
        target,
        label: `${group.length} edges`,
        labelVisible: true,
        // Increase the size based on the number of edges in the group
        // size: Math.min(5, 1 + Math.log(group.length)),
        // Store the original edges in the data property
        data: {
          ...(firstEdge.data || {}),
          originalEdges: group,
          count: group.length
        }
      };

      aggregatedEdges.push(aggregatedEdge);
    }
  });

  return aggregatedEdges;
};
