import { ThreeEvent } from '@react-three/fiber';
export interface HoverIntentOptions {
    interval?: number;
    sensitivity?: number;
    timeout?: number;
    disabled?: boolean;
    onPointerOver: (event: ThreeEvent<PointerEvent>) => void;
    onPointerOut: (event: ThreeEvent<PointerEvent>) => void;
}
export interface HoverIntentResult {
    pointerOut: (event: ThreeEvent<PointerEvent>) => void;
    pointerOver: (event: ThreeEvent<PointerEvent>) => void;
}
/**
 * Hover intent identifies if the user actually is
 * intending to over by measuring the position of the mouse
 * once a pointer enters and determining if in a duration if
 * the mouse moved inside a certain threshold and fires the events.
 */
export declare const useHoverIntent: ({ sensitivity, interval, timeout, disabled, onPointerOver, onPointerOut }: HoverIntentOptions | undefined) => HoverIntentResult;
