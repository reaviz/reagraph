import { Curve, LineCurve3, QuadraticBezierCurve3, Vector3 } from 'three';
import { InternalGraphNode, InternalVector3 } from '../types';

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

// Calculate the center for a quadratic bezier curve.
//
// 1) Find the point halfway between the start and end points of the desired curve
// 2) Find the vector pependicular to that point
// 3) Find the point 1/4 the distance between start and end along that vector.
//
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

export function getCurve(
  from: Vector3,
  fromOffset: number,
  to: Vector3,
  toOffset: number,
  curved: boolean
): Curve<Vector3> {
  const offsetFrom = getPointBetween(from, to, fromOffset);
  const offsetTo = getPointBetween(to, from, toOffset);
  return curved
    ? new QuadraticBezierCurve3(...getCurvePoints(offsetFrom, offsetTo))
    : new LineCurve3(offsetFrom, offsetTo);
}

export function getVector(node: InternalGraphNode): Vector3 {
  return new Vector3(node.position.x, node.position.y, node.position.z || 0);
}

function getPointBetween(from: Vector3, to: Vector3, offset: number): Vector3 {
  const distance = from.distanceTo(to);
  return from.clone().add(
    to
      .clone()
      .sub(from)
      .multiplyScalar(offset / distance)
  );
}
