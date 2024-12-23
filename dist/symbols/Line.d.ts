import { FC } from 'react';
import { Vector3, ColorRepresentation, Curve } from 'three';
import { ThreeEvent } from '@react-three/fiber';
export interface LineProps {
    /**
     * Whether the line should be animated.
     */
    animated?: boolean;
    /**
     * The color of the line.
     */
    color?: ColorRepresentation;
    /**
     * Whether the line should be curved.
     */
    curved: boolean;
    /**
     * The curve of the line in 3D space.
     */
    curve: Curve<Vector3>;
    /**
     * The unique identifier of the line.
     */
    id: string;
    /**
     * The opacity of the line.
     */
    opacity?: number;
    /**
     * The size of the line.
     */
    size?: number;
    /**
     * A function that is called when the line is clicked.
     */
    onClick?: (event: ThreeEvent<MouseEvent>) => void;
    /**
     * A function that is called when the line is right-clicked.
     */
    onContextMenu?: () => void;
    /**
     * A function that is called when the mouse pointer is moved over the line.
     */
    onPointerOver?: (event: ThreeEvent<PointerEvent>) => void;
    /**
     * A function that is called when the mouse pointer is moved out of the line.
     */
    onPointerOut?: (event: ThreeEvent<PointerEvent>) => void;
    /**
     * The offset of the curve.
     */
    curveOffset?: number;
}
export declare const Line: FC<LineProps>;
