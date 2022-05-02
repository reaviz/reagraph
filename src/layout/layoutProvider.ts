import { LayoutFactoryProps, LayoutStrategy } from './types';
import { forceDirected } from './forceDirected';
import { circular2d } from './circular2d';

export function layoutProvider({
  type,
  ...rest
}: LayoutFactoryProps): LayoutStrategy {
  if (type === 'forceDirected2d') {
    return forceDirected(rest);
  } else if (type === 'treeTd') {
    return forceDirected({ ...rest, mode: 'td', dimensions: 2 });
  } else if (type === 'treeLr') {
    return forceDirected({ ...rest, mode: 'lr', dimensions: 2 });
  } else if (type === 'radialOut') {
    return forceDirected({ ...rest, mode: 'radialout', dimensions: 3 });
  } else if (type === 'forceDirected3d') {
    return forceDirected({ ...rest, dimensions: 3 });
  } else if (type === 'circular2d') {
    return circular2d(rest);
  }

  throw new Error(`Layout ${type} not found.`);
}
