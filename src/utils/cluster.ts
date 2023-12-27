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
  nodes: InternalGraphNode[];
  clusterAttribute?: string;
}

export interface ClusterGroup {
  nodes: InternalGraphNode[];
  position: CenterPositionVector;
  label: string;
}

/**
 * Builds the cluster map.
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
