import { forceRadial as d3ForceRadial } from 'd3-force-3d';
import { InternalGraphEdge, InternalGraphNode } from 'types';
import { getNodeDepth } from './depthUtils';

const DAG_LEVEL_NODE_RATIO = 2;
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

/**
 * Radial graph layout using D3 Force 3d.
 * Inspired by: https://github.com/vasturiano/three-forcegraph/blob/master/src/forcegraph-kapsule.js#L970-L1018
 */
export function forceRadial(
  nodes: InternalGraphNode[],
  links: InternalGraphEdge[],
  dagMode: DagMode = 'lr'
) {
  const { depths, maxDepth } = getNodeDepth(nodes, links);

  const modeDistance = RADIALS.includes(dagMode) ? 1 : 5;
  const dagLevelDistance =
    (nodes.length / maxDepth) * DAG_LEVEL_NODE_RATIO * modeDistance;

  if (dagMode) {
    const getFFn =
      (fix: boolean, invert: boolean) => (node: InternalGraphNode) =>
        !fix
          ? undefined
          : (depths[node.id].depth - maxDepth / 2) *
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
      const depth =
          dagMode === 'radialin' ? maxDepth - nodeDepth.depth : nodeDepth.depth;
      return depth * dagLevelDistance;
    }).strength(1)
    : null;
}
