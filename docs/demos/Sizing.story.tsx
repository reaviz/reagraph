import React from 'react';
import { GraphCanvas } from '../../src';
import { simpleEdges, simpleNodes } from '../assets/demo';

export default {
  title: 'Demos/Sizing',
  component: GraphCanvas
};

export const None = () => (
  <GraphCanvas sizingType="none" nodes={simpleNodes} edges={simpleEdges} />
);

export const Centrality = () => (
  <GraphCanvas sizingType="centrality" nodes={simpleNodes} edges={simpleEdges} />
);

export const PageRank = () => (
  <GraphCanvas sizingType="pagerank" nodes={simpleNodes} edges={simpleEdges} />
);

export const Attribute = () => (
  <GraphCanvas sizingType="pagerank" sizingAttribute="priority" nodes={simpleNodes} edges={simpleEdges} />
);
