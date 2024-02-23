import { LayoutFactoryProps, LayoutStrategy } from './types';
import { forceDirected, ForceDirectedLayoutInputs } from './forceDirected';
import { circular2d, CircularLayoutInputs } from './circular2d';
import { hierarchical, HierarchicalLayoutInputs } from './hierarchical';
import { NoOverlapLayoutInputs, nooverlap } from './nooverlap';
import { ForceAtlas2LayoutInputs, forceAtlas2 } from './forceatlas2';
import { custom } from './custom';

export type LayoutOverrides = Partial<
  | Omit<ForceDirectedLayoutInputs, 'dimensions' | 'mode'>
  | CircularLayoutInputs
  | HierarchicalLayoutInputs
>;

export const FORCE_LAYOUTS = [
  'forceDirected2d',
  'treeTd2d',
  'treeLr2d',
  'radialOut2d',
  'treeTd3d',
  'treeLr3d',
  'radialOut3d',
  'forceDirected3d'
];

export function layoutProvider({
  type,
  ...rest
}: LayoutFactoryProps | LayoutOverrides): LayoutStrategy {
  if (FORCE_LAYOUTS.includes(type)) {
    const { nodeStrength, linkDistance, nodeLevelRatio } =
      rest as ForceDirectedLayoutInputs;

    if (type === 'forceDirected2d') {
      return forceDirected({
        ...rest,
        dimensions: 2,
        nodeLevelRatio: nodeLevelRatio || 2,
        nodeStrength: nodeStrength || -250,
        linkDistance,
        forceLayout: type
      } as ForceDirectedLayoutInputs);
    } else if (type === 'treeTd2d') {
      return forceDirected({
        ...rest,
        mode: 'td',
        dimensions: 2,
        nodeLevelRatio: nodeLevelRatio || 5,
        nodeStrength: nodeStrength || -250,
        linkDistance: linkDistance || 50,
        forceLayout: type
      } as ForceDirectedLayoutInputs);
    } else if (type === 'treeLr2d') {
      return forceDirected({
        ...rest,
        mode: 'lr',
        dimensions: 2,
        nodeLevelRatio: nodeLevelRatio || 5,
        nodeStrength: nodeStrength || -250,
        linkDistance: linkDistance || 50,
        forceLayout: type
      } as ForceDirectedLayoutInputs);
    } else if (type === 'radialOut2d') {
      return forceDirected({
        ...rest,
        mode: 'radialout',
        dimensions: 2,
        nodeLevelRatio: nodeLevelRatio || 5,
        nodeStrength: nodeStrength || -500,
        linkDistance: linkDistance || 100,
        forceLayout: type
      } as ForceDirectedLayoutInputs);
    } else if (type === 'treeTd3d') {
      return forceDirected({
        ...rest,
        mode: 'td',
        dimensions: 3,
        nodeLevelRatio: nodeLevelRatio || 2,
        nodeStrength: nodeStrength || -500,
        linkDistance: linkDistance || 50
      } as ForceDirectedLayoutInputs);
    } else if (type === 'treeLr3d') {
      return forceDirected({
        ...rest,
        mode: 'lr',
        dimensions: 3,
        nodeLevelRatio: nodeLevelRatio || 2,
        nodeStrength: nodeStrength || -500,
        linkDistance: linkDistance || 50,
        forceLayout: type
      } as ForceDirectedLayoutInputs);
    } else if (type === 'radialOut3d') {
      return forceDirected({
        ...rest,
        mode: 'radialout',
        dimensions: 3,
        nodeLevelRatio: nodeLevelRatio || 2,
        nodeStrength: nodeStrength || -500,
        linkDistance: linkDistance || 100,
        forceLayout: type
      } as ForceDirectedLayoutInputs);
    } else if (type === 'forceDirected3d') {
      return forceDirected({
        ...rest,
        dimensions: 3,
        nodeLevelRatio: nodeLevelRatio || 2,
        nodeStrength: nodeStrength || -250,
        linkDistance,
        forceLayout: type
      } as ForceDirectedLayoutInputs);
    }
  } else if (type === 'circular2d') {
    const { radius } = rest as CircularLayoutInputs;
    return circular2d({
      ...rest,
      radius: radius || 300
    } as CircularLayoutInputs);
  } else if (type === 'hierarchicalTd') {
    return hierarchical({ ...rest, mode: 'td' } as HierarchicalLayoutInputs);
  } else if (type === 'hierarchicalLr') {
    return hierarchical({ ...rest, mode: 'lr' } as HierarchicalLayoutInputs);
  } else if (type === 'nooverlap') {
    const { graph, maxIterations, ratio, margin, gridSize, ...settings } =
      rest as NoOverlapLayoutInputs;

    return nooverlap({
      type: 'nooverlap',
      graph,
      margin: margin || 10,
      maxIterations: maxIterations || 50,
      ratio: ratio || 10,
      gridSize: gridSize || 20,
      ...settings
    });
  } else if (type === 'forceatlas2') {
    const { graph, iterations, gravity, scalingRatio, ...settings } =
      rest as ForceAtlas2LayoutInputs;

    return forceAtlas2({
      type: 'forceatlas2',
      graph,
      ...settings,
      scalingRatio: scalingRatio || 100,
      gravity: gravity || 10,
      iterations: iterations || 50
    });
  } else if (type === 'custom') {
    return custom({
      type: 'custom',
      ...rest
    } as LayoutFactoryProps);
  }

  throw new Error(`Layout ${type} not found.`);
}
