import { FC } from 'react';
import { ColorRepresentation, Vector3 } from 'three';
export type EdgeArrowPosition = 'none' | 'mid' | 'end';
export interface ArrowProps {
    /**
     * Whether the arrow should be animated.
     */
    animated?: boolean;
    /**
     * The color of the arrow.
     */
    color?: ColorRepresentation;
    /**
     * The length of the arrow.
     */
    length: number;
    /**
     * The opacity of the arrow.
     */
    opacity?: number;
    /**
     * The position of the arrow in 3D space.
     */
    position: Vector3;
    /**
     * The rotation of the arrow in 3D space.
     */
    rotation: Vector3;
    /**
     * The size of the arrow.
     */
    size: number;
    /**
     * A function that is called when the arrow is right-clicked.
     */
    onContextMenu?: () => void;
    /**
     * A function that is called when the arrow is selected or deselected.
     */
    onActive?: (state: boolean) => void;
}
export declare const Arrow: FC<ArrowProps>;
