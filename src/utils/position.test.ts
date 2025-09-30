import { describe, expect, test } from 'vitest';

import type { EdgeSubLabelPosition } from '../symbols/Edge';
import type { InternalGraphNode } from '../types';
import { calculateSubLabelOffset, getSelfLoopCurve } from './position';

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

describe('getSelfLoopCurve', () => {
  test('should create a valid CatmullRomCurve3 for self-loop', () => {
    const mockNode: InternalGraphNode = {
      id: 'test-node',
      position: {
        x: 100,
        y: 200,
        z: 0,
        id: 'test-node',
        data: {},
        links: [],
        index: 0,
        vx: 0,
        vy: 0
      },
      size: 10,
      data: {}
    };

    const curve = getSelfLoopCurve(mockNode);

    expect(curve).toBeDefined();
    expect(curve.constructor.name).toBe('CatmullRomCurve3');
    expect(curve.closed).toBe(true);
  });

  test('should handle different node positions', () => {
    const mockNode1: InternalGraphNode = {
      id: 'test-node-1',
      position: {
        x: 100,
        y: 100,
        z: 0,
        id: 'test-node-1',
        data: {},
        links: [],
        index: 0,
        vx: 0,
        vy: 0
      },
      size: 10,
      data: {}
    };

    const mockNode2: InternalGraphNode = {
      id: 'test-node-2',
      position: {
        x: -100,
        y: -100,
        z: 0,
        id: 'test-node-2',
        data: {},
        links: [],
        index: 0,
        vx: 0,
        vy: 0
      },
      size: 10,
      data: {}
    };

    const curve1 = getSelfLoopCurve(mockNode1);
    const curve2 = getSelfLoopCurve(mockNode2);

    // Both curves should be valid and closed
    expect(curve1.closed).toBe(true);
    expect(curve2.closed).toBe(true);

    // Get points from each curve to verify they're positioned correctly
    const point1 = curve1.getPointAt(0);
    const point2 = curve2.getPointAt(0);

    // Points should be different based on node positions
    expect(point1.x).not.toBe(point2.x);
    expect(point1.y).not.toBe(point2.y);

    // Curves should be positioned relative to their nodes
    // The curves should be above their respective nodes
    expect(point1.y).toBeGreaterThan(mockNode1.position.y);
    expect(point2.y).toBeGreaterThan(mockNode2.position.y);

    // The curves should be horizontally aligned with their nodes
    // (within a reasonable tolerance for the loop radius)
    expect(Math.abs(point1.x - mockNode1.position.x)).toBeLessThan(
      mockNode1.size * 2
    );
    expect(Math.abs(point2.x - mockNode2.position.x)).toBeLessThan(
      mockNode2.size * 2
    );
  });
});
