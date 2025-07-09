import { range } from 'd3-array';
import { GraphEdge, GraphNode } from '../../src';
import demonSvg from './demon.svg';
import computerSvg from './computer.svg';

export const random = (floor, ceil) => Math.floor(Math.random() * ceil) + floor;

export const simpleNodes: GraphNode[] =
  range(5).map(i => ({
    id: `n-${i}`,
    label: `Node ${i}`,
    data: {
      priority: random(0, 10)
    }
  }));

export const parentNodes: GraphNode[] = [
  ...range(5).map(i => {
    if (i === 2) {
      return {
        id: `n-${i}`,
        label: `Node ${i} - 3 Children`,
        data: {
          priority: random(0, 10)
        }
      };
    }

    if (i === 3) {
      return {
        id: `n-${i}`,
        label: `Node ${i} - 1 Child`,
        data: {
          priority: random(0, 10)
        }
      };
    }

    return {
      id: `n-${i}`,
      label: `Node ${i}`,
      data: {
        priority: random(0, 10)
      }
    };
  }),
  ...range(3).map(i => {
    if (i === 0) {
      return {
        id: `n-2-n-${i}`,
        label: `Node 2 > ${i} - 1 Child`,
        data: {
          priority: random(0, 10)
        }
      };
    }

    return {
      id: `n-2-n-${i}`,
      label: `Node 2 > ${i}`,
      data: {
        priority: random(0, 10)
      }
    };
  }),
  {
    id: `n-2-n-0-n-0`,
    label: `Node 2 > Node 0 > Node 0`,
    data: {
      priority: random(0, 10)
    }
  }
]

const types = ['IP', 'URL', 'Email', 'MD5'];
const colors = ['#3730a3', '#c2410c', '#166534', '#075985'];

export const clusterNodes: GraphNode[] =
  range(25).map(i => {
    const idx = random(0, types.length);
    const type = types[idx];

    return {
    id: `n-${i}`,
    label: `${type} ${i}`,
    fill: colors[idx],
    data: {
      type,
      segment: i %2 === 0 ? 'A' : undefined
    }
  }
});

export const singleNodeClusterNodes: GraphNode[] =
  range(2).map(i => {

    const idx = i
    const type = i;

    return {
    id: `n-${i}`,
    label: `${type} ${i}`,
    fill: colors[idx],
    data: {
      type
    }
  }
});

export const imbalancedClusterNodes: GraphNode[] =
  range(20).map(i => {
    const idx = (i == 0) ? 2: (i % 2);
    const type = types[idx];

    return {
    id: `n-${i}`,
    label: `${type} ${i}`,
    fill: colors[idx],
    data: {
      type
    }
  }
});

const manyTypes = ['IPV4', 'URL', 'Email', 'MD5', 'SHA256', 'Domain', 'IPV6', 'CRC32', 'SHA512'];

export const manyClusterNodes: GraphNode[] =
  range(500).map(i => {
    const idx = random(0, manyTypes.length);
    const type = manyTypes[idx];

    return {
    id: `n-${i}`,
    label: `${type} ${i}`,
    fill: colors[idx%colors.length],
    data: {
      type
    }
  }
});

export const clusterEdges: GraphEdge[] = range(random(5, 25)).map(i => ({
  id: `e-${i}`,
  source: `n-${i}`,
  target: `n-${random(0, clusterNodes.length - 1)}`,
  label: '0-1'
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
    size: i % 2 === 0 ? 50 : 25,
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

export const parentEdges: GraphEdge[] = [
  ...simpleEdges,
  {
    id: '2->2-0',
    source: 'n-2',
    target: 'n-2-n-0',
    label: 'Edge 2-2-0'
  },
  {
    id: '2->2-1',
    source: 'n-2',
    target: 'n-2-n-1',
    label: 'Edge 2-2-1'
  },
  {
    id: '2->2-2',
    source: 'n-2',
    target: 'n-2-n-2',
    label: 'Edge 2-2-2'
  },
  {
    id: '2->2-0->2-0-0',
    source: 'n-2-n-0',
    target: 'n-2-n-0-n-0',
    label: 'Edge 2-2-0'
  },
  {
    id: '3->2-0->2-0-0',
    source: 'n-3',
    target: 'n-2-n-0-n-0',
    label: 'Edge 3-2-0'
  }
]

export const treeEdges: GraphEdge[] = [
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
    id: '2->3',
    source: 'n-2',
    target: 'n-3',
    label: 'Edge 2-3'
  },
  {
    id: '3->4',
    source: 'n-3',
    target: 'n-4',
    label: 'Edge 2-3'
  }
];

export const complexNodes: GraphNode[] =
  range(25).map(i => ({
    id: `${i}`,
    label: `Node ${i}`
  }));

export const complexEdges = [
  { id: '0->2', source: '0', target: '2', label: 'Edge 0-2' },
  { id: '1->3', source: '1', target: '3', label: 'Edge 1-3' },
  { id: '2->4', source: '2', target: '4', label: 'Edge 2-4' },
  { id: '3->5', source: '3', target: '5', label: 'Edge 3-5' },
  { id: '5->15', source: '5', target: '15', label: 'Edge 5-15' },
  { id: '5->7', source: '5', target: '7', label: 'Edge 5-7' },
  { id: '6->8', source: '6', target: '8', label: 'Edge 6-8' },
  { id: '7->9', source: '7', target: '9', label: 'Edge 7-9' },
  { id: '8->10', source: '8', target: '10', label: 'Edge 8-10' },
  { id: '9->11', source: '9', target: '11', label: 'Edge 9-11' },
  { id: '10->12', source: '10', target: '12', label: 'Edge 10-12' },
  { id: '11->13', source: '11', target: '13', label: 'Edge 11-13' },
  { id: '22->9', source: '22', target: '9', label: 'Edge 22-9' },
  { id: '13->15', source: '13', target: '15', label: 'Edge 13-15' },
  { id: '14->16', source: '14', target: '16', label: 'Edge 14-16' },
  { id: '15->17', source: '15', target: '17', label: 'Edge 15-17' },
  { id: '16->18', source: '16', target: '18', label: 'Edge 16-18' },
  { id: '17->19', source: '17', target: '19', label: 'Edge 17-19' },
  { id: '18->20', source: '18', target: '20', label: 'Edge 18-20' },
  { id: '19->21', source: '19', target: '21', label: 'Edge 19-21' },
  { id: '20->22', source: '20', target: '22', label: 'Edge 20-22' },
  { id: '21->23', source: '21', target: '23', label: 'Edge 21-23' },
  { id: '22->24', source: '22', target: '24', label: 'Edge 22-24' },
  { id: '23->0', source: '23', target: '0', label: 'Edge 23-0' },
  { id: '24->1', source: '24', target: '1', label: 'Edge 24-1' },
  { id: '0->3', source: '0', target: '3', label: 'Edge 0-3' },
  { id: '1->4', source: '1', target: '4', label: 'Edge 1-4' },
  { id: '2->5', source: '2', target: '5', label: 'Edge 2-5' },
  { id: '3->6', source: '3', target: '6', label: 'Edge 3-6' },
  { id: '4->7', source: '4', target: '7', label: 'Edge 4-7' },
  { id: '5->8', source: '5', target: '8', label: 'Edge 5-8' },
  { id: '6->9', source: '6', target: '9', label: 'Edge 6-9' },
  { id: '7->10', source: '7', target: '10', label: 'Edge 7-10' },
  { id: '8->11', source: '8', target: '11', label: 'Edge 8-11' },
  { id: '9->12', source: '9', target: '12', label: 'Edge 9-12' },
  { id: '10->13', source: '10', target: '13', label: 'Edge 10-13' },
  { id: '11->14', source: '11', target: '14', label: 'Edge 11-14' },
  { id: '12->15', source: '12', target: '15', label: 'Edge 12-15' },
  { id: '13->16', source: '13', target: '16', label: 'Edge 13-16' },
  { id: '14->17', source: '14', target: '17', label: 'Edge 14-17' },
  { id: '15->18', source: '15', target: '18', label: 'Edge 15-18' },
];
