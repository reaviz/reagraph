import { LayoutFactoryProps, LayoutStrategy } from './types';
export interface HierarchicalLayoutInputs extends LayoutFactoryProps {
    /**
     * Direction of the layout. Default 'td'.
     */
    mode?: 'td' | 'lr';
    /**
     * Factor of distance between nodes. Default 1.
     */
    nodeSeparation?: number;
    /**
     * Size of each node. Default [50,50]
     */
    nodeSize?: [number, number];
}
export declare function hierarchical({ graph, drags, mode, nodeSeparation, nodeSize, getNodePosition }: HierarchicalLayoutInputs): LayoutStrategy;
