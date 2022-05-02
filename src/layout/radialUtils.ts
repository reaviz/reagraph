import { forceRadial as d3ForceRadial } from 'd3-force-3d';
import { getNodeDepth } from '../utils/depth';

const DAG_LEVEL_NODE_RATIO = 2;
const RADIALS = ['radialin', 'radialout'];

export type DagMode =
  | 'lr'
  | 'rl'
  | 'td'
  | 'but'
  | 'zout'
  | 'zin'
  | 'radialin'
  | 'radialout';

/**
 * Radial graph layout using D3 Force 3d.
 * Inspired by: https://github.com/vasturiano/three-forcegraph/blob/master/src/forcegraph-kapsule.js#L970-L1018
 */
export function forceRadial(
  nodes: any[],
  links: any[],
  dagMode: DagMode = 'lr'
) {
  const { depths, invalid, maxDepth } = getNodeDepth(nodes, links);

  if (invalid) {
    return null;
  }

  const dagLevelDistance =
    (nodes.length / (maxDepth || 1)) *
    DAG_LEVEL_NODE_RATIO *
    (RADIALS.includes(dagMode) ? 0.7 : 1);

  if (dagMode) {
    const getFFn = (fix, invert) => node =>
      !fix
        ? undefined
        : (depths[node.id] - maxDepth / 2) *
          dagLevelDistance *
          (invert ? -1 : 1);

    const fxFn = getFFn(['lr', 'rl'].includes(dagMode), dagMode === 'rl');
    const fyFn = getFFn(['td', 'bu'].includes(dagMode), dagMode === 'td');
    const fzFn = getFFn(['zin', 'zout'].includes(dagMode), dagMode === 'zout');

    nodes.forEach(node => {
      node.fx = fxFn(node);
      node.fy = fyFn(node);
      node.fz = fzFn(node);
    });
  }

  return RADIALS.includes(dagMode)
    ? d3ForceRadial(node => {
      const nodeDepth = depths[node.id];
      return (
        (dagMode === 'radialin' ? maxDepth - nodeDepth : nodeDepth) *
          dagLevelDistance
      );
    }).strength(1)
    : null;
}
