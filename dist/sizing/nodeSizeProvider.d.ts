import { SizingStrategyInputs } from './types';
export type SizingType = 'none' | 'pagerank' | 'centrality' | 'attribute' | 'default';
export interface NodeSizeProviderInputs extends SizingStrategyInputs {
    /**
     * The sizing strategy to use.
     */
    type: SizingType;
}
export declare function nodeSizeProvider({ type, ...rest }: NodeSizeProviderInputs): Map<any, any>;
