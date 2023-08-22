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
    entryMap.set(val, [...(entryMap.get(val) || []), e]);
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

export interface CalculateCentersInput {
  nodes: InternalGraphNode[];
  clusterAttribute?: string;
  strength?: number;
  clusterStrength?: number;
}

/**
 * Takes a number n and calculates n x/y coordinates along a circle such
 * that they are equally spaced from each other.
 * Inspired by: https://github.com/ToxicJojo/github-issue-visualizer/blob/63c10b75551af57e557f52d9a9ccebbe05e3d12d/app/js/graph/calculate-centers.js
 */
export function caluculateCenters({
  nodes,
  clusterAttribute,
  strength = 100
}: CalculateCentersInput) {
  const centers = new Map<string, { x: number; y: number; z: number }>();

  if (clusterAttribute) {
    const groups = buildClusterGroups(nodes, clusterAttribute);
    const numGroups = groups.size;
    const numNodes = nodes?.length;
    const datasetSizeFactor = numNodes / 100;

    // Heuristics to adjust spacing between clusters

    let idx = 0;
    for (const [key, value] of groups) {
      const radiant = ((2 * Math.PI) / numGroups) * idx;
      const groupSize = value.length;

      // Heuristics to adjust spacing between clusters

      const multiplier = numGroups + datasetSizeFactor;
      const x = Math.cos(radiant) * strength * multiplier;
      const y = Math.sin(radiant) * strength * multiplier;

      idx++;

      centers.set(key, {
        x,
        y,
        z: 1
      });
    }
  }

  return centers;
}
