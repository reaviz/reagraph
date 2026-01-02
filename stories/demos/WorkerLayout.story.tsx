import React from 'react';
import { GraphCanvas, LayoutTypes } from '../../src';
import { simpleNodes, simpleEdges } from '../assets/demo';

export default {
  title: 'Demos/Worker Layout',
  component: GraphCanvas
};

const generateLargeGraph = (nodeCount: number) => {
  const nodes = [];
  const edges = [];

  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      id: `n-${i}`,
      label: `Node ${i}`
    });

    // Create some edges (random connections)
    if (i > 0) {
      // Connect to a random previous node
      const targetIdx = Math.floor(Math.random() * i);
      edges.push({
        id: `e-${i}-${targetIdx}`,
        source: `n-${i}`,
        target: `n-${targetIdx}`
      });
    }
  }

  return { nodes, edges };
};

// Generate graphs for ForceAtlas2 tests
const fa2SmallGraph = generateLargeGraph(50);
const fa2MediumGraph = generateLargeGraph(200);
const fa2LargeGraph = generateLargeGraph(500);

// Generate graphs for force-directed tests
const fd2dMediumGraph = generateLargeGraph(150);
const fd3dMediumGraph = generateLargeGraph(150);

export const SimpleWithWorker = () => (
  <GraphCanvas
    nodes={simpleNodes}
    edges={simpleEdges}
    webWorkers
  />
);

SimpleWithWorker.storyName = 'Simple Graph (Worker)';

export const SimpleWithoutWorker = () => (
  <GraphCanvas
    nodes={simpleNodes}
    edges={simpleEdges}
    webWorkers={false}
  />
);

SimpleWithoutWorker.storyName = 'Simple Graph (Main Thread)';

const mediumGraph = generateLargeGraph(100);

export const MediumGraphWithWorker = () => (
  <GraphCanvas
    nodes={mediumGraph.nodes}
    edges={mediumGraph.edges}
    webWorkers
  />
);

MediumGraphWithWorker.storyName = 'Medium Graph 100 nodes (Worker)';

export const MediumGraphWithoutWorker = () => (
  <GraphCanvas
    nodes={mediumGraph.nodes}
    edges={mediumGraph.edges}
    webWorkers={false}
  />
);

MediumGraphWithoutWorker.storyName = 'Medium Graph 100 nodes (Main Thread)';

const largeGraph = generateLargeGraph(500);

export const LargeGraphWithWorker = () => (
  <GraphCanvas
    nodes={largeGraph.nodes}
    edges={largeGraph.edges}
    webWorkers
    animated={false}
  />
);

LargeGraphWithWorker.storyName = 'Large Graph 500 nodes (Worker)';

export const LargeGraphWithoutWorker = () => (
  <GraphCanvas
    nodes={largeGraph.nodes}
    edges={largeGraph.edges}
    webWorkers={false}
    animated={false}
  />
);

LargeGraphWithoutWorker.storyName = 'Large Graph 500 nodes (Main Thread)';

// ForceAtlas2 Worker Stories (using graphology's native FA2 worker)
export const ForceAtlas2SmallWithWorker = () => (
  <GraphCanvas
    nodes={fa2SmallGraph.nodes}
    edges={fa2SmallGraph.edges}
    layoutType="forceatlas2"
    webWorkers
  />
);

ForceAtlas2SmallWithWorker.storyName = 'ForceAtlas2 50 nodes (Worker)';

export const ForceAtlas2SmallWithoutWorker = () => (
  <GraphCanvas
    nodes={fa2SmallGraph.nodes}
    edges={fa2SmallGraph.edges}
    layoutType="forceatlas2"
    webWorkers={false}
  />
);

ForceAtlas2SmallWithoutWorker.storyName = 'ForceAtlas2 50 nodes (Main Thread)';

export const ForceAtlas2MediumWithWorker = () => (
  <GraphCanvas
    nodes={fa2MediumGraph.nodes}
    edges={fa2MediumGraph.edges}
    layoutType="forceatlas2"
    webWorkers
    animated={false}
  />
);

ForceAtlas2MediumWithWorker.storyName = 'ForceAtlas2 200 nodes (Worker)';

export const ForceAtlas2MediumWithoutWorker = () => (
  <GraphCanvas
    nodes={fa2MediumGraph.nodes}
    edges={fa2MediumGraph.edges}
    layoutType="forceatlas2"
    webWorkers={false}
    animated={false}
  />
);

ForceAtlas2MediumWithoutWorker.storyName = 'ForceAtlas2 200 nodes (Main Thread)';

export const ForceAtlas2LargeWithWorker = () => (
  <GraphCanvas
    nodes={fa2LargeGraph.nodes}
    edges={fa2LargeGraph.edges}
    layoutType="forceatlas2"
    webWorkers
    animated={false}
  />
);

ForceAtlas2LargeWithWorker.storyName = 'ForceAtlas2 500 nodes (Worker)';

export const ForceAtlas2LargeWithoutWorker = () => (
  <GraphCanvas
    nodes={fa2LargeGraph.nodes}
    edges={fa2LargeGraph.edges}
    layoutType="forceatlas2"
    webWorkers={false}
    animated={false}
  />
);

ForceAtlas2LargeWithoutWorker.storyName = 'ForceAtlas2 500 nodes (Main Thread)';

// Force-Directed 2D Worker Stories
export const ForceDirected2DWithWorker = () => (
  <GraphCanvas
    nodes={fd2dMediumGraph.nodes}
    edges={fd2dMediumGraph.edges}
    layoutType="forceDirected2d"
    webWorkers
  />
);

ForceDirected2DWithWorker.storyName = 'ForceDirected 2D 150 nodes (Worker)';

export const ForceDirected2DWithoutWorker = () => (
  <GraphCanvas
    nodes={fd2dMediumGraph.nodes}
    edges={fd2dMediumGraph.edges}
    layoutType="forceDirected2d"
    webWorkers={false}
  />
);

ForceDirected2DWithoutWorker.storyName = 'ForceDirected 2D 150 nodes (Main Thread)';

// Force-Directed 3D Worker Stories
export const ForceDirected3DWithWorker = () => (
  <GraphCanvas
    nodes={fd3dMediumGraph.nodes}
    edges={fd3dMediumGraph.edges}
    layoutType="forceDirected3d"
    webWorkers
    cameraMode="orbit"
  />
);

ForceDirected3DWithWorker.storyName = 'ForceDirected 3D 150 nodes (Worker)';

export const ForceDirected3DWithoutWorker = () => (
  <GraphCanvas
    nodes={fd3dMediumGraph.nodes}
    edges={fd3dMediumGraph.edges}
    layoutType="forceDirected3d"
    webWorkers={false}
    cameraMode="orbit"
  />
);

ForceDirected3DWithoutWorker.storyName = 'ForceDirected 3D 150 nodes (Main Thread)';
