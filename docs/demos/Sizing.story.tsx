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

const MinMaxSizesStory = (props) => (
  <GraphCanvas {...props} sizingType="centrality" nodes={simpleNodes} edges={simpleEdges} />
);

export const MinMaxSizes = MinMaxSizesStory.bind({});
MinMaxSizes.args = {
  minNodeSize: 10,
  maxNodeSize: 25
};

export const PageRank = () => (
  <GraphCanvas sizingType="pagerank" nodes={simpleNodes} edges={simpleEdges} />
);

export const Attribute = () => (
  <GraphCanvas
    sizingType="attribute"
    sizingAttribute="priority"
    minNodeSize={2}
    maxNodeSize={25}
    nodes={simpleNodes}
    edges={simpleEdges}
  />
);
