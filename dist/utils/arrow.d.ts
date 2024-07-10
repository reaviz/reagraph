import { Curve, Vector3 } from 'three';
import { EdgeArrowPosition } from '../symbols/Arrow';
export declare function getArrowVectors(placement: EdgeArrowPosition, curve: Curve<Vector3>, arrowLength: number): [Vector3, Vector3];
export declare function getArrowSize(size: number): [number, number];
