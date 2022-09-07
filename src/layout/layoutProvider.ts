import { LayoutFactoryProps, LayoutStrategy } from './types';
import { forceDirected, ForceDirectedLayoutInputs } from './forceDirected';
import { circular2d, CircularLayoutInputs } from './circular2d';
import { hierarchical, HierarchicalLayoutInputs } from './hierarchical';

export type LayoutOverrides = Partial<
  Omit<ForceDirectedLayoutInputs, 'dimensions' | 'mode'> | CircularLayoutInputs
>;

const FORCE_LAYOUTS = [
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
    const {
      nodeStrength,
      linkDistance,
      clusterPadding,
      clusterStrength,
      nodeLevelRatio
    } = rest as ForceDirectedLayoutInputs;

    if (type === 'forceDirected2d') {
      return forceDirected({
        ...rest,
        dimensions: 2,
        nodeLevelRatio: nodeLevelRatio || 2,
        nodeStrength: nodeStrength || -250,
        linkDistance: linkDistance || 50,
        clusterPadding: clusterPadding || 10,
        clusterStrength: clusterStrength || 0.5
      } as ForceDirectedLayoutInputs);
    } else if (type === 'treeTd2d') {
      return forceDirected({
        ...rest,
        mode: 'td',
        dimensions: 2,
        nodeLevelRatio: nodeLevelRatio || 5,
        nodeStrength: nodeStrength || -250,
        linkDistance: linkDistance || 50
      } as ForceDirectedLayoutInputs);
    } else if (type === 'treeLr2d') {
      return forceDirected({
        ...rest,
        mode: 'lr',
        dimensions: 2,
        nodeLevelRatio: nodeLevelRatio || 5,
        nodeStrength: nodeStrength || -250,
        linkDistance: linkDistance || 50
      } as ForceDirectedLayoutInputs);
    } else if (type === 'radialOut2d') {
      return forceDirected({
        ...rest,
        mode: 'radialout',
        dimensions: 2,
        nodeLevelRatio: nodeLevelRatio || 5,
        nodeStrength: nodeStrength || -500,
        linkDistance: linkDistance || 100
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
        linkDistance: linkDistance || 50
      } as ForceDirectedLayoutInputs);
    } else if (type === 'radialOut3d') {
      return forceDirected({
        ...rest,
        mode: 'radialout',
        dimensions: 3,
        nodeLevelRatio: nodeLevelRatio || 2,
        nodeStrength: nodeStrength || -500,
        linkDistance: linkDistance || 100
      } as ForceDirectedLayoutInputs);
    } else if (type === 'forceDirected3d') {
      return forceDirected({
        ...rest,
        dimensions: 3,
        nodeLevelRatio: nodeLevelRatio || 2,
        nodeStrength: nodeStrength || -250,
        linkDistance: linkDistance || 50
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
  }

  throw new Error(`Layout ${type} not found.`);
}
