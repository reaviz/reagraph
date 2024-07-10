import { LayoutFactoryProps } from './types';
export interface CircularLayoutInputs extends LayoutFactoryProps {
    /**
     * Radius of the circle.
     */
    radius: 300;
}
export declare function circular2d({ graph, radius, drags, getNodePosition }: CircularLayoutInputs): {
    step(): boolean;
    getNodePosition(id: string): any;
};
