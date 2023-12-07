import { Curve, LineCurve3, QuadraticBezierCurve3, Vector3 } from 'three';
import { InternalGraphNode, InternalVector3 } from '../types';

const MULTI_EDGE_OFFSET_FACTOR = 0.7;

/**
 * Get the midpoint given two points.
 */
export function getMidPoint(
  from: InternalVector3,
  to: InternalVector3,
  offset = 0
) {
  const fromVector = new Vector3(from.x, from.y || 0, from.z || 0);
  const toVector = new Vector3(to.x, to.y || 0, to.z || 0);
  const midVector = new Vector3()
    .addVectors(fromVector, toVector)
    .divideScalar(2);

  return midVector.setLength(midVector.length() + offset);
}

/**
 * Calculate the center for a quadratic bezier curve.
 *
 * 1) Find the point halfway between the start and end points of the desired curve
 * 2) Find the vector pependicular to that point
 * 3) Find the point 1/4 the distance between start and end along that vector.
 */
export function getCurvePoints(
  from: Vector3,
  to: Vector3,
  offset = -1
): [Vector3, Vector3, Vector3] {
  const fromVector = from.clone();
  const toVector = to.clone();
  const v = new Vector3().subVectors(toVector, fromVector);
  const vlen = v.length();
  const vn = v.clone().normalize();
  const vv = new Vector3().subVectors(toVector, fromVector).divideScalar(2);
  const k = Math.abs(vn.x) % 1;
  const b = new Vector3(-vn.y, vn.x - k * vn.z, k * vn.y).normalize();
  const vm = new Vector3()
    .add(fromVector)
    .add(vv)
    .add(b.multiplyScalar(vlen / 4).multiplyScalar(offset));

  return [from, vm, to];
}

/**
 * Get the curve given two points.
 */
export function getCurve(
  from: Vector3,
  fromOffset: number,
  to: Vector3,
  toOffset: number,
  curved: boolean,
  curveOffset?: number
): Curve<Vector3> {
  const offsetFrom = getPointBetween(from, to, fromOffset);
  const offsetTo = getPointBetween(to, from, toOffset);
  return curved
    ? new QuadraticBezierCurve3(
      ...getCurvePoints(offsetFrom, offsetTo, curveOffset)
    )
    : new LineCurve3(offsetFrom, offsetTo);
}

/**
 * Create a threejs vector for a node.
 */
export function getVector(node: InternalGraphNode): Vector3 {
  return new Vector3(node.position.x, node.position.y, node.position.z || 0);
}

/**
 * Get the point between two vectors.
 */
function getPointBetween(from: Vector3, to: Vector3, offset: number): Vector3 {
  const distance = from.distanceTo(to);
  return from.clone().add(
    to
      .clone()
      .sub(from)
      .multiplyScalar(offset / distance)
  );
}

/**
 * Given a node and a new vector set, update the node model.
 */
export function updateNodePosition(node: InternalGraphNode, offset: Vector3) {
  return {
    ...node,
    position: {
      ...node.position,
      x: node.position.x + offset.x,
      y: node.position.y + offset.y,
      z: node.position.z + offset.z
    }
  };
}

/**
 * Calculate the curve offset for an edge.
 * This is used to offset edges that are parallel to each other (same source and same target).
 * This will return a curveOffset of null if the edge is not parallel to any other edges.
 */
export function calculateEdgeCurveOffset({ edge, edges, curved }) {
  let updatedCurved = curved;
  let curveOffset: number;

  const parallelEdges = edges
    .filter(e => e.target === edge.target && e.source === edge.source)
    .map(e => e.id);

  if (parallelEdges.length > 1) {
    updatedCurved = true;
    const edgeIndex = parallelEdges.indexOf(edge.id);

    if (parallelEdges.length === 2) {
      curveOffset =
        edgeIndex === 0 ? MULTI_EDGE_OFFSET_FACTOR : -MULTI_EDGE_OFFSET_FACTOR;
    } else {
      curveOffset =
        (edgeIndex - Math.floor(parallelEdges.length / 2)) *
        MULTI_EDGE_OFFSET_FACTOR;
    }
  }

  return { curved: updatedCurved, curveOffset };
}
