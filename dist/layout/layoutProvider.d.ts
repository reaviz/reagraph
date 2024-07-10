import { LayoutFactoryProps, LayoutStrategy } from './types';
import { ForceDirectedLayoutInputs } from './forceDirected';
import { CircularLayoutInputs } from './circular2d';
import { HierarchicalLayoutInputs } from './hierarchical';
export type LayoutOverrides = Partial<Omit<ForceDirectedLayoutInputs, 'dimensions' | 'mode'> | CircularLayoutInputs | HierarchicalLayoutInputs>;
export declare const FORCE_LAYOUTS: string[];
export declare function layoutProvider({ type, ...rest }: LayoutFactoryProps | LayoutOverrides): LayoutStrategy;
