import React from 'react';
import { GraphCanvas } from '../../src';
import { simpleEdges, simpleNodes } from '../assets/demo';

export default {
  title: 'Demos/Edges/Arrows',
  component: GraphCanvas
};

export const End = () => (
  <GraphCanvas
    edgeArrowPosition="end"
    nodes={simpleNodes}
    edges={simpleEdges}
  />
);

export const Mid = () => (
  <GraphCanvas
    edgeArrowPosition="mid"
    nodes={simpleNodes}
    edges={simpleEdges}
  />
);

export const None = () => (
  <GraphCanvas
    edgeArrowPosition="none"
    nodes={simpleNodes}
    edges={simpleEdges}
  />
);
