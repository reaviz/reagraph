import { Curve, Vector3 } from 'three';
import { InternalGraphNode, InternalVector3 } from '../types';
/**
 * Get the midpoint given two points.
 */
export declare function getMidPoint(from: InternalVector3, to: InternalVector3, offset?: number): Vector3;
/**
 * Calculate the center for a quadratic bezier curve.
 *
 * 1) Find the point halfway between the start and end points of the desired curve
 * 2) Find the vector pependicular to that point
 * 3) Find the point 1/4 the distance between start and end along that vector.
 */
export declare function getCurvePoints(from: Vector3, to: Vector3, offset?: number): [Vector3, Vector3, Vector3];
/**
 * Get the curve given two points.
 */
export declare function getCurve(from: Vector3, fromOffset: number, to: Vector3, toOffset: number, curved: boolean, curveOffset?: number): Curve<Vector3>;
/**
 * Create a threejs vector for a node.
 */
export declare function getVector(node: InternalGraphNode): Vector3;
/**
 * Given a node and a new vector set, update the node model.
 */
export declare function updateNodePosition(node: InternalGraphNode, offset: Vector3): {
    position: {
        x: number;
        y: number;
        z: number;
        id: string;
        data: any;
        links: import("../types").InternalGraphLink[];
        index: number;
        vx: number;
        vy: number;
    };
    fx?: number;
    fy?: number;
    fz?: number;
    parents?: string[];
    icon?: string;
    fill?: string;
    id: string;
    data?: any;
    label?: string;
    subLabel?: string;
    size?: number;
    labelVisible?: boolean;
};
/**
 * Calculate the curve offset for an edge.
 * This is used to offset edges that are parallel to each other (same source and same target).
 * This will return a curveOffset of null if the edge is not parallel to any other edges.
 */
export declare function calculateEdgeCurveOffset({ edge, edges, curved }: {
    edge: any;
    edges: any;
    curved: any;
}): {
    curved: any;
    curveOffset: number;
};
