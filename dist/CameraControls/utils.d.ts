import { PerspectiveCamera } from 'three';
import { InternalGraphPosition } from '../types';
/**
 * Returns whether the node is in view of the camera.
 */
export declare function isNodeInView(camera: PerspectiveCamera, nodePosition: InternalGraphPosition): boolean;
/**
 * Get the closest axis to a given angle.
 */
export declare function getClosestAxis(angle: number, axes: number[]): number;
/**
 * Get how far an angle is from the closest 2D axis in radians.
 */
export declare function getDegreesToClosest2dAxis(horizontalAngle: number, verticalAngle: number): {
    horizontalRotation: number;
    verticalRotation: number;
};
