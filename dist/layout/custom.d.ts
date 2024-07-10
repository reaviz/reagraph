import { LayoutFactoryProps } from './types';
export declare function custom({ graph, drags, getNodePosition }: LayoutFactoryProps): {
    step(): boolean;
    getNodePosition(id: string): import("..").InternalGraphPosition;
};
