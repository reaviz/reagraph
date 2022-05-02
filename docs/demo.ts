import { range } from 'd3-array';
import { GraphEdge, GraphNode } from '../src';

export const simpleNodes: GraphNode[] =
  range(5).map(i => ({
    id: `n-${i}`,
    label: `Node ${i}`,
    data: {
      priority: Math.floor(Math.random() * 10) + 1
    }
  }));

export const manyNodes: GraphNode[] =
  range(100).map(i => ({
    id: `n-${i}`,
    label: `Node ${i}`,
    data: {
      priority: Math.floor(Math.random() * 10) + 1
    }
  }));

export const simpleEdges: GraphEdge[] = [
  {
    id: '0->1',
    source: 'n-0',
    target: 'n-1',
    label: 'Edge 0-1'
  },
  {
    id: '0->2',
    source: 'n-0',
    target: 'n-2',
    label: 'Edge 0-2'
  },
  {
    id: '0->3',
    source: 'n-0',
    target: 'n-3',
    label: 'Edge 0-3'
  },
  {
    id: '0->4',
    source: 'n-0',
    target: 'n-4',
    label: 'Edge 0-4'
  }
];
