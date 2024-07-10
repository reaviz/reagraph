import { LayoutFactoryProps } from './types';
export interface NoOverlapLayoutInputs extends LayoutFactoryProps {
    /**
     * Grid size. Default 20.
     */
    gridSize?: number;
    /**
     * Ratio of the layout. Default 10.
     */
    ratio?: number;
    /**
     * Maximum number of iterations. Default 50.
     */
    maxIterations?: number;
    /**
     * Margin between nodes. Default 10.
     */
    margin?: number;
}
export declare function nooverlap({ graph, margin, drags, getNodePosition, ratio, gridSize, maxIterations }: NoOverlapLayoutInputs): {
    step(): boolean;
    getNodePosition(id: string): any;
};
