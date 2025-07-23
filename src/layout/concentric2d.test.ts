import { expect, test, describe } from 'vitest';
import { concentric2d } from './concentric2d';
import Graph from 'graphology';

describe('concentric2d', () => {
  test('should create concentric layout with degree centrality', () => {
    const graph = new Graph();

    // Create a simple graph with different degrees
    graph.addNode('1', { x: 0, y: 0, z: 0 });
    graph.addNode('2', { x: 0, y: 0, z: 0 });
    graph.addNode('3', { x: 0, y: 0, z: 0 });
    graph.addNode('4', { x: 0, y: 0, z: 0 });

    // Node 1 has highest degree (3 connections)
    graph.addEdge('1', '2');
    graph.addEdge('1', '3');
    graph.addEdge('1', '4');

    // Node 2 has degree 2
    graph.addEdge('2', '3');

    // Nodes 3 and 4 have degree 1

    const layout = concentric2d({
      graph,
      type: 'concentric2d',
      minRadius: 50,
      maxRadius: 200,
      center: [0, 0],
      useDegreeCentrality: true,
      getNodePosition: () => undefined
    });

    // Test that layout returns positions
    const pos1 = layout.getNodePosition('1');
    const pos2 = layout.getNodePosition('2');
    const pos3 = layout.getNodePosition('3');
    const pos4 = layout.getNodePosition('4');

    expect(pos1).toBeDefined();
    expect(pos2).toBeDefined();
    expect(pos3).toBeDefined();
    expect(pos4).toBeDefined();

    // Test that positions are different (not all at origin)
    expect(pos1.x).not.toBe(0);
    expect(pos1.y).not.toBe(0);
    expect(pos2.x).not.toBe(0);
    expect(pos2.y).not.toBe(0);

    // Test step function returns true (layout is static)
    expect(layout.step()).toBe(true);
  });

  test('should handle empty graph', () => {
    const graph = new Graph();

    const layout = concentric2d({
      graph,
      type: 'concentric2d',
      getNodePosition: () => undefined
    });

    expect(layout.step()).toBe(true);
  });

  test('should handle single node', () => {
    const graph = new Graph();
    graph.addNode('1', { x: 0, y: 0, z: 0 });

    const layout = concentric2d({
      graph,
      type: 'concentric2d',
      center: [100, 100],
      getNodePosition: () => undefined
    });

    const pos = layout.getNodePosition('1');
    expect(pos).toBeDefined();
    expect(pos.x).toBe(100);
    expect(pos.y).toBe(100);
  });
});
