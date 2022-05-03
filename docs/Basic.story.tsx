import React from 'react';
import { darkTheme, GraphCanvas } from '../src';
import { simpleEdges, simpleNodes } from './assets/demo';

export default {
  title: 'Demos/Basic',
  component: GraphCanvas
};

export const Simple = () => (
  <GraphCanvas nodes={simpleNodes} edges={simpleEdges} />
);

export const DarkTheme = () => (
  <GraphCanvas
    theme={darkTheme}
    nodes={simpleNodes}
    edges={simpleEdges}
  />
);
