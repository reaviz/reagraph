import {
  BoxGeometry,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  Curve,
  Float32BufferAttribute,
  TubeGeometry,
  Vector3
} from 'three';
import { mergeBufferGeometries } from 'three-stdlib';

/**
 * Create a null geometry with consistent attributes
 * @returns A BufferGeometry with a null appearance
 */
export const createNullGeometry = (): BufferGeometry => {
  const nullGeom = new BoxGeometry(0, 0, 0);
  // Add color attribute to match other geometries
  const vertexCount = nullGeom.attributes.position.count;
  const colorArray = new Float32Array(vertexCount * 3);
  for (let i = 0; i < vertexCount; i++) {
    colorArray[i * 3] = 1; // white
    colorArray[i * 3 + 1] = 1;
    colorArray[i * 3 + 2] = 1;
  }
  nullGeom.setAttribute('color', new Float32BufferAttribute(colorArray, 3));

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
        const segmentGeometry = new TubeGeometry(
          segmentCurve,
          Math.max(2, points.length - 1),
          radius,
          5,
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
