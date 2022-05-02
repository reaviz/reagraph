import React from 'react';
import { GraphCanvas } from '../src';
import { simpleEdges, simpleNodes } from './demo';

export default {
  title: 'Demos/Basic',
  component: GraphCanvas
};

export const Simple = () => (
  <GraphCanvas nodes={simpleNodes} edges={simpleEdges} />
);
