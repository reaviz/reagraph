import { Vector3 } from 'three';
import { InternalGraphNode, InternalVector3 } from '../types';

export interface EdgeVectors3 {
  from: InternalVector3;
  to: InternalVector3;
}

function pointAtLine(
  from: InternalVector3,
  to: InternalVector3,
  size: number
): Vector3 {
  const { distance, fromVector, toVector } = calcDistance({ from, to });
  if (distance < size) {
    // NOTE: This is a hacky way to get the from position
    // we should not do this long term
    // @ts-ignore
    return from;
  }

  return fromVector.add(
    toVector.sub(fromVector).multiplyScalar(size / distance)
  );
}

const getVectors = ({ from, to }: EdgeVectors3) => [
  new Vector3(from.x, from.y || 0, from.z || 0),
  new Vector3(to.x, to.y || 0, to.z || 0)
];

function calcDistance({ from, to }: EdgeVectors3) {
  const [fromVector, toVector] = getVectors({ from, to });
  return {
    distance: fromVector.distanceTo(toVector),
    fromVector,
    toVector
  };
}

export interface GetPointsInput {
  from: InternalGraphNode;
  to: InternalGraphNode;
}

export const getPoints = ({ from, to }: GetPointsInput) => ({
  from: pointAtLine(from.position, to.position, from.size),
  to: pointAtLine(to.position, from.position, to.size)
});

export function getMidPoint(positions: EdgeVectors3, offset = 0) {
  const [fromVector, toVector] = getVectors(positions);
  const midVector = new Vector3()
    .addVectors(fromVector, toVector)
    .divideScalar(2);

  return midVector.setLength(midVector.length() + offset);
}

export function getArrowPosition(positions: EdgeVectors3, arrowSize = 1) {
  const [from, to] = getVectors(positions);
  const diff = to.sub(from);

  return from.add(diff.setLength(diff.length() - arrowSize / 2));
}

export function getQuaternion(positions: EdgeVectors3) {
  const [fromVector, toVector] = getVectors(positions);
  const dir = new Vector3().subVectors(toVector, fromVector);
  const axis = new Vector3(0, 1, 0);
  return [axis, dir.clone().normalize()];
}
