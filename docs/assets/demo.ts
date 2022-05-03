import { range } from 'd3-array';
import { GraphEdge, GraphNode } from '../../src';
import random from 'lodash/random';
import demonSvg from './demon.svg';
import computerSvg from './computer.svg';
import generators from 'ngraph.generators';

export const simpleNodes: GraphNode[] =
  range(5).map(i => ({
    id: `n-${i}`,
    label: `Node ${i}`,
    data: {
      priority: random(0, 10)
    }
  }));

export const simpleNodesColors: GraphNode[] =
  range(5).map(i => ({
    id: `n-${i}`,
    label: `Node ${i}`,
    fill: `hsl(${random(0, 360)}, 100%, 50%)`,
  }));

export const iconNodes: GraphNode[] =
  range(5).map(i => ({
    id: `n-${i}`,
    label: `Node ${i}`,
    icon: i % 2 === 0 ? computerSvg : demonSvg,
    data: {
      priority: random(0, 10)
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

export const [complexNodes, complexEdges] = transformGenerator(generators.balancedBinTree(3));

export function transformGenerator(g) {
  const nodes = [];
  const edges = [];

  g.forEachNode(node => {
    nodes.push({
      id: node.id,
      label: node.id
    });

    node.links.forEach(link => {
      edges.push({
        id: `${node.id}->${link.toId}`,
        source: link.fromId,
        target: link.toId,
        label: `${link.fromId}->${link.toId}`
      });
    });
  });

  return [nodes, edges];
}
