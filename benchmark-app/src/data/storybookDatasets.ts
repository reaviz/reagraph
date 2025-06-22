/**
 * ReaGraph Storybook Demo Datasets
 * Imported from the main library's Storybook demos for comprehensive testing
 */

import { GraphData, BenchmarkTest } from '../types/benchmark.types';
import { generateNetworkTopology, generateNetworkScenarios } from '../utils/networkTopologyGenerator';

// Utility functions
const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const random = (floor: number, ceil: number) => Math.floor(Math.random() * ceil) + floor;

// === BASIC DATASETS ===

export const simpleNodes = range(5).map(i => ({
  id: `n-${i}`,
  label: `Node ${i}`,
  data: {
    priority: random(0, 10)
  }
}));

export const simpleEdges = [
  { id: '0->1', source: 'n-0', target: 'n-1', label: 'Edge 0-1' },
  { id: '0->2', source: 'n-0', target: 'n-2', label: 'Edge 0-2' },
  { id: '0->3', source: 'n-0', target: 'n-3', label: 'Edge 0-3' },
  { id: '0->4', source: 'n-0', target: 'n-4', label: 'Edge 0-4' }
];

export const simpleNodesColors = range(5).map(i => ({
  id: `n-${i}`,
  label: `Node ${i}`,
  color: `hsl(${random(0, 360)}, 100%, 50%)`
}));

// === HIERARCHICAL/TREE DATASETS ===

export const parentNodes = [
  ...range(5).map(i => {
    const getLabel = () => {
      if (i === 2) return `Node ${i} - 3 Children`;
      if (i === 3) return `Node ${i} - 1 Child`;
      return `Node ${i}`;
    };

    return {
      id: `n-${i}`,
      label: getLabel(),
      data: { priority: random(0, 10) }
    };
  }),
  ...range(3).map(i => ({
    id: `n-2-n-${i}`,
    label: i === 0 ? `Node 2 > ${i} - 1 Child` : `Node 2 > ${i}`,
    data: { priority: random(0, 10) }
  })),
  {
    id: `n-2-n-0-n-0`,
    label: `Node 2 > Node 0 > Node 0`,
    data: { priority: random(0, 10) }
  }
];

export const parentEdges = [
  ...simpleEdges,
  { id: '2->2-0', source: 'n-2', target: 'n-2-n-0', label: 'Edge 2-2-0' },
  { id: '2->2-1', source: 'n-2', target: 'n-2-n-1', label: 'Edge 2-2-1' },
  { id: '2->2-2', source: 'n-2', target: 'n-2-n-2', label: 'Edge 2-2-2' },
  { id: '2->2-0->2-0-0', source: 'n-2-n-0', target: 'n-2-n-0-n-0', label: 'Edge 2-2-0' },
  { id: '3->2-0->2-0-0', source: 'n-3', target: 'n-2-n-0-n-0', label: 'Edge 3-2-0' }
];

export const treeEdges = [
  { id: '0->1', source: 'n-0', target: 'n-1', label: 'Edge 0-1' },
  { id: '0->2', source: 'n-0', target: 'n-2', label: 'Edge 0-2' },
  { id: '2->3', source: 'n-2', target: 'n-3', label: 'Edge 2-3' },
  { id: '3->4', source: 'n-3', target: 'n-4', label: 'Edge 2-3' }
];

// === CLUSTER DATASETS ===

const types = ['IP', 'URL', 'Email', 'MD5'];
const colors = ['#3730a3', '#c2410c', '#166534', '#075985'];

export const clusterNodes = range(25).map(i => {
  const idx = random(0, types.length);
  const type = types[idx];

  return {
    id: `n-${i}`,
    label: `${type} ${i}`,
    color: colors[idx],
    data: {
      type,
      segment: i % 2 === 0 ? 'A' : undefined
    }
  };
});

export const clusterEdges = range(random(5, 25)).map(i => ({
  id: `e-${i}`,
  source: `n-${i}`,
  target: `n-${random(0, clusterNodes.length - 1)}`,
  label: '0-1'
}));

export const imbalancedClusterNodes = range(20).map(i => {
  const idx = (i === 0) ? 2 : (i % 2);
  const type = types[idx];

  return {
    id: `n-${i}`,
    label: `${type} ${i}`,
    color: colors[idx],
    data: { type }
  };
});

// === PERFORMANCE DATASETS ===

export const manyNodes = range(100).map(i => ({
  id: `n-${i}`,
  label: `Node ${i}`,
  data: { priority: Math.floor(Math.random() * 10) + 1 }
}));

const manyTypes = ['IPV4', 'URL', 'Email', 'MD5', 'SHA256', 'Domain', 'IPV6', 'CRC32', 'SHA512'];

export const manyClusterNodes = range(500).map(i => {
  const idx = random(0, manyTypes.length);
  const type = manyTypes[idx];

  return {
    id: `n-${i}`,
    label: `${type} ${i}`,
    color: colors[idx % colors.length],
    data: { type }
  };
});

// === COMPLEX NETWORKS ===

export const complexNodes = range(25).map(i => ({
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
  { id: '15->18', source: '15', target: '18', label: 'Edge 15-18' }
];

// === ADDITIONAL EDGE SETS ===

// Generate many edges for the many nodes dataset  
export const manyEdges = range(200).map(i => ({
  id: `e-${i}`,
  source: `n-${random(0, 99)}`,
  target: `n-${random(0, 99)}`
}));

// Generate many cluster edges for performance testing
export const manyClusterEdges = range(750).map(i => ({
  id: `e-${i}`,
  source: `n-${random(0, 499)}`,
  target: `n-${random(0, 499)}`
}));

// === PREDEFINED BENCHMARK TESTS ===

export function createStorybookBenchmarkTests(): BenchmarkTest[] {
  return [
    // Basic functionality tests
    {
      id: 'storybook-simple',
      name: 'Simple Graph (Storybook)',
      description: 'Basic 5-node graph from Storybook demos',
      nodeCount: simpleNodes.length,
      edgeCount: simpleEdges.length,
      category: 'small',
      dataset: { nodes: simpleNodes, edges: simpleEdges }
    },
    {
      id: 'storybook-colors',
      name: 'Colored Nodes (Storybook)',
      description: '5 nodes with random HSL colors',
      nodeCount: simpleNodesColors.length,
      edgeCount: simpleEdges.length,
      category: 'small',
      dataset: { nodes: simpleNodesColors, edges: simpleEdges }
    },
    
    // Hierarchical structures
    {
      id: 'storybook-hierarchy',
      name: 'Hierarchical Graph (Storybook)',
      description: 'Parent-child relationships with 9 nodes',
      nodeCount: parentNodes.length,
      edgeCount: parentEdges.length,
      category: 'small',
      dataset: { nodes: parentNodes, edges: parentEdges }
    },
    {
      id: 'storybook-tree',
      name: 'Tree Structure (Storybook)',
      description: 'Simple tree layout with 5 nodes',
      nodeCount: simpleNodes.length,
      edgeCount: treeEdges.length,
      category: 'small',
      dataset: { nodes: simpleNodes, edges: treeEdges }
    },

    // Clustering demos
    {
      id: 'storybook-clusters',
      name: 'Cluster Graph (Storybook)',
      description: '25 nodes with type-based clustering',
      nodeCount: clusterNodes.length,
      edgeCount: clusterEdges.length,
      category: 'medium',
      dataset: { nodes: clusterNodes, edges: clusterEdges }
    },
    {
      id: 'storybook-imbalanced',
      name: 'Imbalanced Clusters (Storybook)',
      description: '20 nodes with uneven cluster distribution',
      nodeCount: imbalancedClusterNodes.length,
      edgeCount: clusterEdges.slice(0, 15).length,
      category: 'small',
      dataset: { 
        nodes: imbalancedClusterNodes, 
        edges: clusterEdges.slice(0, 15).map(e => ({
          ...e,
          source: `n-${random(0, 19)}`,
          target: `n-${random(0, 19)}`
        }))
      }
    },

    // Complex networks
    {
      id: 'storybook-complex',
      name: 'Complex Network (Storybook)',
      description: '25 nodes with complex interconnections',
      nodeCount: complexNodes.length,
      edgeCount: complexEdges.length,
      category: 'medium',
      dataset: { nodes: complexNodes, edges: complexEdges }
    },

    // Performance tests
    {
      id: 'storybook-medium',
      name: 'Medium Performance (Storybook)',
      description: '100 nodes performance baseline',
      nodeCount: manyNodes.length,
      edgeCount: manyEdges.length,
      category: 'medium',
      dataset: { nodes: manyNodes, edges: manyEdges }
    },
    {
      id: 'storybook-large',
      name: 'Large Clusters (Storybook)',
      description: '500 nodes with clustering - Storybook stress test',
      nodeCount: manyClusterNodes.length,
      edgeCount: manyClusterEdges.length,
      category: 'massive',
      dataset: { nodes: manyClusterNodes, edges: manyClusterEdges }
    },

    // Interactive tests with animations
    {
      id: 'storybook-animated-simple',
      name: 'Animated Simple Graph',
      description: 'Basic 5-node graph with animations enabled',
      nodeCount: simpleNodes.length,
      edgeCount: simpleEdges.length,
      category: 'small',
      dataset: { nodes: simpleNodes, edges: simpleEdges },
      animated: true
    },
    {
      id: 'storybook-animated-complex',
      name: 'Animated Complex Network',
      description: '25 nodes with animations - tests animation performance',
      nodeCount: complexNodes.length,
      edgeCount: complexEdges.length,
      category: 'medium',
      dataset: { nodes: complexNodes, edges: complexEdges },
      animated: true
    },

    // Collapsible hierarchy tests
    {
      id: 'storybook-collapsible',
      name: 'Collapsible Hierarchy',
      description: 'Two-level nested nodes with collapse functionality',
      nodeCount: parentNodes.length,
      edgeCount: parentEdges.length,
      category: 'small',
      dataset: { nodes: parentNodes, edges: parentEdges },
      interactive: true,
      initialCollapsedNodeIds: ['n-2']
    },
    {
      id: 'storybook-animated-collapsible',
      name: 'Animated Collapsible Hierarchy',
      description: 'Two-level nested nodes with animations and collapse',
      nodeCount: parentNodes.length,
      edgeCount: parentEdges.length,
      category: 'small',
      dataset: { nodes: parentNodes, edges: parentEdges },
      animated: true,
      interactive: true,
      initialCollapsedNodeIds: ['n-2']
    },

    // Large collapsible test
    {
      id: 'storybook-large-collapsible',
      name: 'Large Collapsible Network',
      description: 'Complex network with collapsible clusters',
      nodeCount: complexNodes.length,
      edgeCount: complexEdges.length,
      category: 'medium',
      dataset: { nodes: complexNodes, edges: complexEdges },
      interactive: true,
      animated: true,
      initialCollapsedNodeIds: ['5', '10', '15']
    },

    // Network Topology Tests - 8 Level Deep Hierarchy
    {
      id: 'network-topology-small',
      name: 'Network Topology - Small (8 Levels)',
      description: '8-level network hierarchy with curved animated edges - Small scale',
      ...(() => {
        const topology = generateNetworkScenarios().small;
        return {
          nodeCount: topology.nodes.length,
          edgeCount: topology.edges.length,
          category: 'medium' as const,
          dataset: topology,
          animated: true,
          interactive: true,
          edgeInterpolation: 'curved' as const,
          layoutType: 'hierarchicalTd',
          initialCollapsedNodeIds: topology.metadata.defaultCollapsedIds
        };
      })()
    },
    {
      id: 'network-topology-medium',
      name: 'Network Topology - Medium (8 Levels)',
      description: '8-level network infrastructure with cross-connections - Medium scale',
      ...(() => {
        const topology = generateNetworkScenarios().medium;
        return {
          nodeCount: topology.nodes.length,
          edgeCount: topology.edges.length,
          category: 'large' as const,
          dataset: topology,
          animated: true,
          interactive: true,
          edgeInterpolation: 'curved' as const,
          layoutType: 'hierarchicalTd',
          initialCollapsedNodeIds: topology.metadata.defaultCollapsedIds
        };
      })()
    },
    {
      id: 'network-topology-large',
      name: 'Network Topology - Large (8 Levels)',
      description: 'Enterprise network with 8 hierarchy levels - Performance test',
      ...(() => {
        const topology = generateNetworkScenarios().large;
        return {
          nodeCount: topology.nodes.length,
          edgeCount: topology.edges.length,
          category: 'massive' as const,
          dataset: topology,
          animated: true,
          interactive: true,
          edgeInterpolation: 'curved' as const,
          layoutType: 'hierarchicalTd',
          initialCollapsedNodeIds: topology.metadata.defaultCollapsedIds
        };
      })()
    },
    {
      id: 'network-topology-enterprise',
      name: 'Network Topology - Enterprise (8 Levels)',
      description: 'Massive enterprise network - Extreme performance test',
      ...(() => {
        const topology = generateNetworkScenarios().enterprise;
        return {
          nodeCount: topology.nodes.length,
          edgeCount: topology.edges.length,
          category: 'extreme' as const,
          dataset: topology,
          animated: true,
          interactive: true,
          edgeInterpolation: 'curved' as const,
          layoutType: 'hierarchicalTd',
          initialCollapsedNodeIds: topology.metadata.defaultCollapsedIds
        };
      })()
    }
  ];
}