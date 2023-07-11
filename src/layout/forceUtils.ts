import { forceRadial as d3ForceRadial } from 'd3-force-3d';
import { InternalGraphEdge, InternalGraphNode } from 'types';
import { getNodeDepth } from './depthUtils';

const RADIALS: DagMode[] = ['radialin', 'radialout'];

export type DagMode =
  | 'lr'
  | 'rl'
  | 'td'
  | 'but'
  | 'zout'
  | 'zin'
  | 'radialin'
  | 'radialout';

export interface ForceRadialInputs {
  nodes: InternalGraphNode[];
  edges: InternalGraphEdge[];
  mode: DagMode;
  nodeLevelRatio: number;
}

/**
 * Radial graph layout using D3 Force 3d.
 * Inspired by: https://github.com/vasturiano/three-forcegraph/blob/master/src/forcegraph-kapsule.js#L970-L1018
 */
export function forceRadial({
  nodes,
  edges,
  mode = 'lr',
  nodeLevelRatio = 2
}: ForceRadialInputs) {
  const { depths, maxDepth, invalid } = getNodeDepth(nodes, edges);

  if (invalid) {
    return null;
  }

  const modeDistance = RADIALS.includes(mode) ? 1 : 5;
  const dagLevelDistance =
    (nodes.length / maxDepth) * nodeLevelRatio * modeDistance;

  if (mode) {
    const getFFn =
      (fix: boolean, invert: boolean) => (node: InternalGraphNode) =>
        !fix
          ? undefined
          : (depths[node.id].depth - maxDepth / 2) *
            dagLevelDistance *
            (invert ? -1 : 1);

    const fxFn = getFFn(['lr', 'rl'].includes(mode), mode === 'rl');
    const fyFn = getFFn(['td', 'bu'].includes(mode), mode === 'td');
    const fzFn = getFFn(['zin', 'zout'].includes(mode), mode === 'zout');

    nodes.forEach(node => {
      node.fx = fxFn(node);
      node.fy = fyFn(node);
      node.fz = fzFn(node);
    });
  }

  return RADIALS.includes(mode)
    ? d3ForceRadial(node => {
      const nodeDepth = depths[node.id];
      const depth =
          mode === 'radialin' ? maxDepth - nodeDepth.depth : nodeDepth.depth;
      return depth * dagLevelDistance;
    }).strength(1)
    : null;
}

/**
 * Takes a number n and calculates n x/y coordinates along a circle such
 * that they are equally spaced from each other.
 * Inspired by: https://github.com/ToxicJojo/github-issue-visualizer/blob/63c10b75551af57e557f52d9a9ccebbe05e3d12d/app/js/graph/calculate-centers.js
 */
export function caluculateCenters(
  nodes: InternalGraphNode[],
  clusterAttribute?: string
) {
  const centers = new Map<string, { x: number; y: number; z: number }>();

  if (clusterAttribute) {
    const groups = nodes.reduce((entryMap, e) => {
      const val = e.data[clusterAttribute];
      entryMap.set(val, [...(entryMap.get(val) || []), e]);
      return entryMap;
    }, new Map());

    const count = groups.size;

    let idx = 0;
    for (const [key] of groups) {
      const radiant = ((2 * Math.PI) / count) * idx;
      const x = Math.cos(radiant) * 100;
      const y = Math.sin(radiant) * 100;
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
