import { expect, test, describe } from 'vitest';
import { getClosestAxis, getDegreesToClosest2dAxis } from './utils';

describe('getDegreesToClosest2dAxis', () => {
  test('should return the correct rotations for given angles', () => {
    const result = getDegreesToClosest2dAxis(0.1, 3.1);

    expect(result).toEqual({
      horizontalRotation: -0.1,
      verticalRotation: -1.5292036732051035
    });
  });

  test('should handle angles greater than 360 degrees', () => {
    const result = getDegreesToClosest2dAxis(
      (5 * Math.PI) / 2,
      (5 * Math.PI) / 2
    );

    expect(result).toEqual({
      horizontalRotation: -Math.PI / 2,
      verticalRotation: 0
    });
  });
});

describe('getClosestAxis', () => {
  test('should return the closest axis for a given angle', () => {
    const axes = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    const result = getClosestAxis(Math.PI / 3, axes);
    expect(result).toBe(Math.PI / 2);
  });

  test('should handle negative angles', () => {
    const axes = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    const result = getClosestAxis(-Math.PI / 4, axes);
    expect(result).toBe(0);
  });

  test('should handle angles greater than 360 degrees', () => {
    const axes = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    const result = getClosestAxis((5 * Math.PI) / 2, axes);
    expect(result).toBe(Math.PI / 2);
  });
});
