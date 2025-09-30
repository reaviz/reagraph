import Graph from 'graphology';
import { beforeEach, describe, expect, test } from 'vitest';

import type { GraphEdge, GraphNode } from '../types';
import { aggregateEdges } from './aggregateEdges';
import { buildGraph } from './graph';

describe('aggregateEdges', () => {
  let graph: Graph;

  beforeEach(() => {
    graph = new Graph({ multi: true });
  });

  test('should return original edges when no aggregation needed', () => {
    const nodes: GraphNode[] = [
      { id: 'A', label: 'Node A' },
      { id: 'B', label: 'Node B' },
      { id: 'C', label: 'Node C' }
    ];

    const edges: GraphEdge[] = [
      {
        id: 'edge1',
        source: 'A',
        target: 'B',
        size: 2,
        label: 'Connection AB'
      },
      { id: 'edge2', source: 'B', target: 'C', size: 3, label: 'Link BC' },
      { id: 'edge3', source: 'A', target: 'C', size: 1, label: 'Path AC' }
    ];

    buildGraph(graph, nodes, edges);
    const result = aggregateEdges(graph);

    expect(result).toHaveLength(3);
    // Single edges should preserve their original labels
    expect(result[0].label).toBe('Connection AB');
    expect(result[1].label).toBe('Link BC');
    expect(result[2].label).toBe('Path AC');
    // Single edges should not be marked as aggregated
    expect(result[0].data.isAggregated).toBe(false);
    expect(result[1].data.isAggregated).toBe(false);
    expect(result[2].data.isAggregated).toBe(false);
  });

  test('should aggregate multiple edges between same nodes', () => {
    const nodes: GraphNode[] = [
      { id: 'A', label: 'Node A' },
      { id: 'B', label: 'Node B' }
    ];

    const edges: GraphEdge[] = [
      { id: 'edge1', source: 'A', target: 'B', size: 2 },
      { id: 'edge2', source: 'A', target: 'B', size: 2 },
      { id: 'edge3', source: 'A', target: 'B', size: 2 }
    ];

    buildGraph(graph, nodes, edges);
    const result = aggregateEdges(graph);

    expect(result).toHaveLength(1);
    expect(result[0].source).toBe('A');
    expect(result[0].target).toBe('B');
    expect(result[0].label).toBe('3 edges');
    expect(result[0].size).toBe(5); // 2 + (3 * 2 * 0.5) = 5
    expect(result[0].data.isAggregated).toBe(true);
    expect(result[0].data.count).toBe(3);
  });

  test('should handle mixed scenario with some aggregation', () => {
    const nodes: GraphNode[] = [
      { id: 'A', label: 'Node A' },
      { id: 'B', label: 'Node B' },
      { id: 'C', label: 'Node C' }
    ];

    const edges: GraphEdge[] = [
      // Two edges A->B (will be aggregated)
      { id: 'edge1', source: 'A', target: 'B', size: 1 },
      { id: 'edge2', source: 'A', target: 'B', size: 1 },
      // One edge B->C (no aggregation)
      { id: 'edge3', source: 'B', target: 'C', size: 3 }
    ];

    buildGraph(graph, nodes, edges);
    const result = aggregateEdges(graph);

    expect(result).toHaveLength(2);

    const abEdge = result.find(e => e.source === 'A' && e.target === 'B');
    const bcEdge = result.find(e => e.source === 'B' && e.target === 'C');

    expect(abEdge.label).toBe('2 edges');
    expect(abEdge.size).toBe(2); // 1 + (2 * 1 * 0.5) = 2
    expect(abEdge.data.isAggregated).toBe(true);

    expect(bcEdge.label).toBeUndefined(); // Single edge should not have aggregation label
    expect(bcEdge.size).toBe(4.5); // 3 + (1 * 3 * 0.5) = 4.5
    expect(bcEdge.data.isAggregated).toBe(false); // Single edge is not aggregated
  });
});
