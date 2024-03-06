import { PerspectiveCamera } from 'three';
import { InternalGraphPosition } from '../types';

/**
 * Get the visible height at the z depth.
 * Ref: https://discourse.threejs.org/t/functions-to-calculate-the-visible-width-height-at-a-given-z-depth-from-a-perspective-camera/269
 */
function visibleHeightAtZDepth(depth: number, camera: PerspectiveCamera) {
  // compensate for cameras not positioned at z=0
  const cameraOffset = camera.position.z;
  if (depth < cameraOffset) depth -= cameraOffset;
  else depth += cameraOffset;

  // vertical fov in radians
  const vFOV = ((camera.fov / camera.zoom) * Math.PI) / 180;

  // Math.abs to ensure the result is always positive
  return 2 * Math.tan(vFOV / 2) * Math.abs(depth);
}

/**
 * Get the visible width at the z depth.
 */
function visibleWidthAtZDepth(depth: number, camera: PerspectiveCamera) {
  const height = visibleHeightAtZDepth(depth, camera);
  return height * camera.aspect;
}

/**
 * Returns whether the node is in view of the camera.
 */
export function isNodeInView(
  camera: PerspectiveCamera,
  nodePosition: InternalGraphPosition
): boolean {
  const visibleWidth = visibleWidthAtZDepth(1, camera);
  const visibleHeight = visibleHeightAtZDepth(1, camera);

  // The boundary coordinates of the area visible to the camera relative to the scene
  const visibleArea = {
    x0: camera?.position?.x - visibleWidth / 2,
    x1: camera?.position?.x + visibleWidth / 2,
    y0: camera?.position?.y - visibleHeight / 2,
    y1: camera?.position?.y + visibleHeight / 2
  };

  return (
    nodePosition?.x > visibleArea.x0 &&
    nodePosition?.x < visibleArea.x1 &&
    nodePosition?.y > visibleArea.y0 &&
    nodePosition?.y < visibleArea.y1
  );
}

/**
 * Get the closest axis to a given angle.
 */
export function getClosestAxis(angle: number, axes: number[]) {
  return axes.reduce((prev, curr) =>
    Math.abs(curr - (angle % Math.PI)) < Math.abs(prev - (angle % Math.PI))
      ? curr
      : prev
  );
}

/**
 * Get how far an angle is from the closest 2D axis in radians.
 */
export function getDegreesToClosest2dAxis(
  horizontalAngle: number,
  verticalAngle: number
) {
  const closestHorizontalAxis = getClosestAxis(horizontalAngle, [0, Math.PI]);
  const closestVerticalAxis = getClosestAxis(verticalAngle, [
    Math.PI / 2,
    (3 * Math.PI) / 2
  ]);

  return {
    horizontalRotation: closestHorizontalAxis - (horizontalAngle % Math.PI),
    verticalRotation: closestVerticalAxis - (verticalAngle % Math.PI)
  };
}
