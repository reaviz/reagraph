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
