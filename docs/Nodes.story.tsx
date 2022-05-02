import React from 'react';
import { GraphCanvas } from '../src';
import { manyNodes, simpleEdges, simpleNodes } from './demo';

export default {
  title: 'Demos/Nodes',
  component: GraphCanvas
};

export const AllNodes = () => (
  <GraphCanvas nodes={manyNodes} edges={[]} />
);
