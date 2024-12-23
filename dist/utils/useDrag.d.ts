import { Vector3 } from 'three';
import { InternalGraphPosition } from '../types';
import { CenterPositionVector } from './layout';
interface DragParams {
    draggable: boolean;
    position: InternalGraphPosition;
    bounds?: CenterPositionVector;
    set: (position: Vector3) => void;
    onDragStart: () => void;
    onDragEnd: () => void;
}
export declare const useDrag: ({ draggable, set, position, bounds, onDragStart, onDragEnd }: DragParams) => (...args: any[]) => import("@use-gesture/react/dist/declarations/src/types").ReactDOMAttributes;
export {};
