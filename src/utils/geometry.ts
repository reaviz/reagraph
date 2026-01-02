import type { Color, Curve, Vector3 } from 'three';
import {
  BufferGeometry,
  CatmullRomCurve3,
  Float32BufferAttribute,
  TubeGeometry
} from 'three';
import { mergeBufferGeometries } from 'three-stdlib';

/**
 * Create a minimal geometry for use as a placeholder when no edges exist.
 * Must be compatible with TubeGeometry for mergeBufferGeometries to work.
 * TubeGeometry has: position, normal, uv attributes + index buffer
 * @returns A BufferGeometry compatible with TubeGeometry
 */
export const createNullGeometry = (): BufferGeometry => {
  // Create a minimal indexed geometry - a single degenerate triangle (3 vertices at origin)
  // This matches TubeGeometry's attribute structure for merge compatibility
  const nullGeom = new BufferGeometry();

  // 3 vertices for a degenerate triangle (all at origin, not visible)
  const positions = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const normals = new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0]);
  const uvs = new Float32Array([0, 0, 0, 0, 0, 0]); // uv is vec2
  const colors = new Float32Array([1, 1, 1, 1, 1, 1, 1, 1, 1]); // white

  nullGeom.setAttribute('position', new Float32BufferAttribute(positions, 3));
  nullGeom.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  nullGeom.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  nullGeom.setAttribute('color', new Float32BufferAttribute(colors, 3));

  // Add index buffer to match TubeGeometry's indexed geometry
  nullGeom.setIndex([0, 1, 2]);

  return nullGeom;
};

/**
 * Add a color attribute to a geometry
 * @param geometry - The geometry to add the color attribute to
 * @param color - The color to add to the geometry
 */
export const addColorAttribute = (
  geometry: BufferGeometry,
  color: Color
): void => {
  const vertexCount = geometry.attributes.position.count;
  const colorArray = new Float32Array(vertexCount * 3);
  for (let i = 0; i < vertexCount; i++) {
    colorArray[i * 3] = color.r;
    colorArray[i * 3 + 1] = color.g;
    colorArray[i * 3 + 2] = color.b;
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colorArray, 3));
};

/**
 * Create actual dashed geometry with gaps by making multiple small tube segments
 * @param curve - The curve to create a dashed geometry from
 * @param radius - The radius of the tube
 * @param color - The color of the tube
 * @param dashArray - The dash array [dashSize, gapSize]
 * @returns A BufferGeometry with a dashed appearance
 */
export const createDashedGeometry = (
  curve: Curve<Vector3>,
  radius: number,
  color: Color,
  dashArray: [number, number] = [3, 1]
): BufferGeometry => {
  const [dashSize, gapSize] = dashArray;
  const totalSize = dashSize + gapSize;
  const curveLength = curve.getLength();

  // Calculate number of dashes based on curve length
  const numDashes = Math.max(3, Math.floor(curveLength / totalSize));
  const segments: BufferGeometry[] = [];

  for (let i = 0; i < numDashes; i++) {
    const startT = i / numDashes;
    const endT = startT + dashSize / totalSize / numDashes;

    if (endT > startT && startT < 1) {
      // Create points for this dash segment
      const points = [];
      const segmentSteps = Math.max(3, Math.floor(8 * (endT - startT))); // More points for longer segments

      for (let j = 0; j <= segmentSteps; j++) {
        const t = startT + (endT - startT) * (j / segmentSteps);
        if (t <= 1) {
          points.push(curve.getPointAt(t));
        }
      }

      if (points.length >= 2) {
        // Create a curve from these points
        const segmentCurve = new CatmullRomCurve3(points);
        // Performance: Use reduced radial segments (3 instead of 5)
        const segmentGeometry = new TubeGeometry(
          segmentCurve,
          Math.max(2, points.length - 1),
          radius,
          3,
          false
        );

        // Add color to this segment
        addColorAttribute(segmentGeometry, color);
        segments.push(segmentGeometry);
      }
    }
  }

  return segments.length > 0
    ? mergeBufferGeometries(segments)
    : new BufferGeometry();
};
