import React from 'react';
import { GraphCanvas } from '../src';
import { iconNodes, manyNodes, simpleEdges } from './assets/demo';

export default {
  title: 'Demos/Nodes',
  component: GraphCanvas
};

export const AllNodes = () => (
  <GraphCanvas nodes={manyNodes} edges={[]} />
);

export const Icons = () => (
  <GraphCanvas nodes={iconNodes} edges={simpleEdges} />
);
