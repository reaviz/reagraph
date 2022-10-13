import { Vector3 } from 'three';
import { InternalVector3 } from '../types';

export interface EdgeVectors3 {
  from: InternalVector3;
  to: InternalVector3;
}

const getVectors = ({ from, to }: EdgeVectors3) => [
  new Vector3(from.x, from.y || 0, from.z || 0),
  new Vector3(to.x, to.y || 0, to.z || 0)
];

export function getMidPoint(positions: EdgeVectors3, offset = 0) {
  const [fromVector, toVector] = getVectors(positions);
  const midVector = new Vector3()
    .addVectors(fromVector, toVector)
    .divideScalar(2);

  return midVector.setLength(midVector.length() + offset);
}

export function getRotation(positions: EdgeVectors3): Vector3 {
  const [fromVector, toVector] = getVectors(positions);
  const dir = new Vector3().subVectors(toVector, fromVector);
  return dir.clone().normalize();
}

export function getCurvePoints(from: Vector3, to: Vector3) {
  const fromVector = from.clone();
  const toVector = to.clone();
  const bend = 1;
  const v = new Vector3().subVectors(toVector, fromVector);
  const vn = v.clone().normalize();
  const vlen = v.length();
  const vv = new Vector3().subVectors(toVector, fromVector).divideScalar(2);
  const k = Math.abs(vn.x) % 1;
  const b = new Vector3(-vn.y, vn.x - k * vn.z, k * vn.y).normalize();
  const vm = new Vector3()
    .add(fromVector)
    .add(vv)
    .add(b.multiplyScalar(vlen / 4).multiplyScalar(bend));

  return [from, vm, to];
}
