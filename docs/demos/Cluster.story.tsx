import random from 'lodash/random';
import React from 'react';
import { GraphCanvas } from '../../src';
import { clusterNodes } from '../assets/demo';

export default {
  title: 'Demos/Cluster',
  component: GraphCanvas
};

export const Simple = () => (
  <GraphCanvas nodes={clusterNodes} edges={[]} clusterAttribute="type" />
);

const clusterNodesWithSizes = clusterNodes.map(node => ({
  ...node,
  size: random(0, 50)
}));

export const Sizes = () => (
  <GraphCanvas nodes={clusterNodesWithSizes} edges={[]} clusterAttribute="type" />
);
