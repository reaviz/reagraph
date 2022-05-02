import React from 'react';
import { GraphCanvas } from '../src';
import { simpleEdges, simpleNodes } from './assets/demo';

export default {
  title: 'Demos/Labels',
  component: GraphCanvas
};

export const All = () => (
  <GraphCanvas labelType="all" nodes={simpleNodes} edges={simpleEdges} />
);

export const NodesOnly = () => (
  <GraphCanvas labelType="nodes" nodes={simpleNodes} edges={simpleEdges} />
);

export const EdgesOnly = () => (
  <GraphCanvas labelType="edges" nodes={simpleNodes} edges={simpleEdges} />
);

export const Automatic = () => (
  <GraphCanvas labelType="auto" nodes={simpleNodes} edges={simpleEdges} />
);
