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
