import React from 'react';
import { GraphCanvas, lightTheme } from '../../src';
import { clusterNodes, clusterEdges, random } from '../assets/demo';

export default {
  title: 'Demos/Cluster',
  component: GraphCanvas
};

export const Simple = () => (
  <GraphCanvas nodes={clusterNodes} draggable edges={[]} clusterAttribute="type" />
);

const clusterNodesWithSizes = clusterNodes.map(node => ({
  ...node,
  size: random(0, 50)
}));

export const Sizes = () => (
  <GraphCanvas nodes={clusterNodesWithSizes} draggable edges={[]} clusterAttribute="type" />
);

export const Edges = () => (
  <GraphCanvas nodes={clusterNodes} draggable edges={clusterEdges} clusterAttribute="type" />
);

export const NoBoundary = () => (
  <GraphCanvas
    theme={{
      ...lightTheme,
      cluster: null
    }}
    nodes={clusterNodes}
    draggable
    edges={clusterEdges}
    clusterAttribute="type"
  />
);

export const NoLabels = () => (
  <GraphCanvas
    theme={{
      ...lightTheme,
      cluster: {
        ...lightTheme.cluster,
        label: null
      }
    }}
    nodes={clusterNodes}
    draggable
    edges={clusterEdges}
    clusterAttribute="type"
  />
);

export const LabelsOnly = () => (
  <GraphCanvas
    theme={{
      ...lightTheme,
      cluster: {
        ...lightTheme.cluster,
        stroke: null
      }
    }}
    nodes={clusterNodes}
    draggable
    edges={clusterEdges}
    clusterAttribute="type"
  />
);

export const ThreeDimensions = () => (
  <GraphCanvas
    nodes={clusterNodesWithSizes}
    draggable edges={[]}
    layoutType="forceDirected3d"
    clusterAttribute="type"
  >
    <directionalLight position={[0, 5, -4]} intensity={1} />
  </GraphCanvas>
);
