import * as THREE from 'three';

export interface EdgeVector {
  from: THREE.Vector3;
  to: THREE.Vector3;
}

function pointAtLine(from: THREE.Vector3, to: THREE.Vector3, size: number) {
  const { distance, fromVector, toVector } = calcDistance({ from, to });
  if (distance < size) {
    return from;
  }

  return fromVector.add(
    toVector.sub(fromVector).multiplyScalar(size / distance)
  );
}

const getVectors = ({ from, to }: EdgeVector) => [
  new THREE.Vector3(from.x, from.y || 0, from.z || 0),
  new THREE.Vector3(to.x, to.y || 0, to.z || 0)
];

function calcDistance({ from, to }) {
  const [fromVector, toVector] = getVectors({ from, to });
  return {
    distance: fromVector.distanceTo(toVector),
    fromVector,
    toVector
  };
}

export const getPoints = ({ from, to }) => ({
  from: pointAtLine(from.position, to.position, from.size),
  to: pointAtLine(to.position, from.position, to.size)
});

export function getMidPoint(positions: EdgeVector) {
  const [fromVector, toVector] = getVectors(positions);
  return new THREE.Vector3().addVectors(fromVector, toVector).divideScalar(2);
}

export function getEndPoint(positions: EdgeVector) {
  const { fromVector, toVector, distance } = calcDistance(positions);
  return toVector.add(fromVector.sub(toVector).multiplyScalar(3 / distance));
}

export function getQuaternion(positions: EdgeVector) {
  const [fromVector, toVector] = getVectors(positions);
  const dir = new THREE.Vector3().subVectors(toVector, fromVector);
  const axis = new THREE.Vector3(0, 1, 0);
  return [axis, dir.clone().normalize()];
}
