import React from 'react';
import { GraphCanvas } from '../../src';
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

export const ThreeDimensions = () => (
  <GraphCanvas nodes={clusterNodesWithSizes} draggable edges={[]} layoutType="forceDirected3d" clusterAttribute="type" />
);
