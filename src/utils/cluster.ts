import { InternalGraphNode } from '../types';
import { CenterPositionVector, getLayoutCenter } from './layout';

/**
 * Given nodes and a attribute, find all the cluster groups.
 */
export function buildClusterGroups(
  nodes: InternalGraphNode[],
  clusterAttribute?: string
) {
  if (!clusterAttribute) {
    return new Map();
  }

  return nodes.reduce((entryMap, e) => {
    const val = e.data[clusterAttribute];
    if (val) {
      entryMap.set(val, [...(entryMap.get(val) || []), e]);
    }
    return entryMap;
  }, new Map());
}

export interface CalculateClustersInput {
  /**
   * The nodes to calculate clusters for.
   */
  nodes: InternalGraphNode[];
  /**
   * The attribute to use for clustering.
   */
  clusterAttribute?: string;
}

export interface ClusterGroup {
  /**
   * Nodes in the cluster.
   */
  nodes: InternalGraphNode[];

  /**
   * Center position of the cluster.
   */
  position: CenterPositionVector;

  /**
   * Label of the cluster.
   */
  label: string;
}

/**
 * Builds the cluster map.
 *
 * This function:
 *  - Builds the cluster groups
 *  - Calculates the center position of each cluster group
 *  - Creates a cluster object for each group
 */
export function calculateClusters({
  nodes,
  clusterAttribute
}: CalculateClustersInput) {
  const result = new Map<string, ClusterGroup>();

  if (clusterAttribute) {
    const groups = buildClusterGroups(nodes, clusterAttribute);
    for (const [key, nodes] of groups) {
      const position = getLayoutCenter(nodes);
      result.set(key, {
        label: key,
        nodes,
        position
      });
    }
  }

  return result;
}
