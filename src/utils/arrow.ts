import { Curve, Vector3 } from 'three';

import { EdgeArrowPosition } from '../symbols/Arrow';

// Calculate the correct position for an arrow along a curve,
// as well as the tangent to the curve at that point.
export function getArrowVectors(
  placement: EdgeArrowPosition,
  curve: Curve<Vector3>,
  arrowLength: number
): [Vector3, Vector3] {
  const curveLength = curve.getLength();
  const absSize = placement === 'end' ? curveLength : curveLength / 2;
  const offset = placement === 'end' ? arrowLength / 2 : 0;
  const u = (absSize - offset) / curveLength;

  const position = curve.getPointAt(u);
  const rotation = curve.getTangentAt(u);

  return [position, rotation];
}

export function getArrowSize(size: number): [number, number] {
  return [size + 6, 2 + size / 1.5];
}
