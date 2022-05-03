import React from 'react';
import { GraphCanvas } from '../src';
import { iconNodes, manyNodes, simpleEdges, simpleNodesColors } from './assets/demo';

export default {
  title: 'Demos/Nodes',
  component: GraphCanvas
};

export const NoEdges = () => (
  <GraphCanvas nodes={manyNodes} edges={[]} />
);

export const Icons = () => (
  <GraphCanvas nodes={iconNodes} edges={simpleEdges} />
);

export const Colors = () => (
  <GraphCanvas nodes={simpleNodesColors} edges={simpleEdges} />
);
