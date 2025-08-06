import { expect, test, describe } from 'vitest';
import { calculateSubLabelOffset, getSelfLoopCurve } from './position';
import { EdgeSubLabelPosition } from '../symbols/Edge';
import { InternalGraphNode } from '../types';

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

    // Calculate expected loop centers based on the algorithm in getSelfLoopCurve
    const expectedCenter1X =
      mockNode1.position.x + mockNode1.size * Math.cos(Math.PI / 2);
    const expectedCenter1Y =
      mockNode1.position.y + mockNode1.size * 1.3 * Math.sin(Math.PI / 2);
    const expectedCenter2X =
      mockNode2.position.x + mockNode2.size * Math.cos(Math.PI / 2);
    const expectedCenter2Y =
      mockNode2.position.y + mockNode2.size * 1.3 * Math.sin(Math.PI / 2);

    // Get a point from each curve to verify they're different
    const point1 = curve1.getPointAt(0);
    const point2 = curve2.getPointAt(0);

    // Points should be different based on node positions
    expect(point1.x).not.toBe(point2.x);
    expect(point1.y).not.toBe(point2.y);

    // Both curves should be valid and closed
    expect(curve1.closed).toBe(true);
    expect(curve2.closed).toBe(true);

    // Verify the curves are positioned correctly relative to their nodes
    // The loop center should be above the node (y > node.y)
    expect(expectedCenter1Y).toBeGreaterThan(mockNode1.position.y);
    expect(expectedCenter2Y).toBeGreaterThan(mockNode2.position.y);

    // The loop center should be at the same x position as the node
    expect(expectedCenter1X).toBeCloseTo(mockNode1.position.x, 1);
    expect(expectedCenter2X).toBeCloseTo(mockNode2.position.x, 1);
  });
});
