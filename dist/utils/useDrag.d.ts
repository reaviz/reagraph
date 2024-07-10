import { Vector3 } from 'three';
import { InternalGraphPosition } from '../types';
interface DragParams {
    draggable: boolean;
    position: InternalGraphPosition;
    set: (position: Vector3) => void;
    onDragStart: () => void;
    onDragEnd: () => void;
}
export declare const useDrag: ({ draggable, set, position, onDragStart, onDragEnd }: DragParams) => (...args: any[]) => import("react-use-gesture/dist/types").ReactEventHandlers;
export {};
