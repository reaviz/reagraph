import { expect, test, describe } from 'vitest';
import { calculateSubLabelOffset } from './position';
import { EdgeSubLabelPosition } from '../symbols/Edge';

describe('calculateSubLabelOffset', () => {
  // Test case 1: Edge going from left to right with 'below' placement
  test('should place label below when edge goes left to right and placement is below', () => {
    const fromPosition = { x: 0, y: 0 };
    const toPosition = { x: 100, y: 100 };

    const result = calculateSubLabelOffset(fromPosition, toPosition);

    // For a horizontal edge going left to right with 'below' placement,
    // the offset should be downward (negative y)
    expect(result.y).toBeLessThan(0);
    expect(result.z).toBe(0);
  });

  // Test case 2: Edge going from left to right with 'above' placement
  test('should place label above when edge goes left to right and placement is above', () => {
    const fromPosition = { x: 0, y: 0 };
    const toPosition = { x: 100, y: 100 };
    const placement: EdgeSubLabelPosition = 'above';

    const result = calculateSubLabelOffset(fromPosition, toPosition, placement);

    // For a horizontal edge going left to right with 'above' placement,
    // the offset should be upward (positive y)
    expect(result.y).toBeGreaterThan(0);
    expect(result.z).toBe(0);
  });

  // Test case 3: Edge going from right to left with 'below' placement
  test('should place label below when edge goes right to left and placement is below', () => {
    const fromPosition = { x: 100, y: 100 };
    const toPosition = { x: 0, y: 0 };
    const placement: EdgeSubLabelPosition = 'below';

    const result = calculateSubLabelOffset(fromPosition, toPosition, placement);

    // For a horizontal edge going right to left with 'below' placement,
    // the offset should be upward (positive y)
    expect(result.y).toBeLessThan(0);
    expect(result.z).toBe(0);
  });

  // Test case 4: Edge going from right to left with 'above' placement
  test('should place label above when edge goes right to left and placement is above', () => {
    const fromPosition = { x: 0, y: 0 };
    const toPosition = { x: 100, y: 100 };
    const placement: EdgeSubLabelPosition = 'above';

    const result = calculateSubLabelOffset(fromPosition, toPosition, placement);

    // For a horizontal edge going right to left with 'above' placement,
    // the offset should be downward (negative y)
    expect(result.y).toBeGreaterThan(0);
    expect(result.z).toBe(0);
  });
});
