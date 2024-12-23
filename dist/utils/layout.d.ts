import { InternalGraphNode } from '../types';
export interface CenterPositionVector {
    x: number;
    y: number;
    z: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
    height: number;
    width: number;
}
/**
 * Given a collection of nodes, get the center point.
 */
export declare function getLayoutCenter(nodes: InternalGraphNode[]): CenterPositionVector;
