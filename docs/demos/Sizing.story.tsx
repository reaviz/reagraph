import React from 'react';
import { GraphCanvas } from '../../src';
import { simpleEdges, simpleNodes } from '../assets/demo';
import { commonArgTypes, commonArgs } from '../shared/storybook-args';

export default {
  title: 'Demos/Sizing',
  component: GraphCanvas,
  argTypes: commonArgTypes
};

const NoneStory = args => <GraphCanvas {...args} />;

export const None = NoneStory.bind({});
None.args = {
  ...commonArgs,
  sizingType: 'none',
  nodes: simpleNodes,
  edges: simpleEdges
};

const CentralityStory = args => <GraphCanvas {...args} />;

export const Centrality = CentralityStory.bind({});
Centrality.args = {
  ...commonArgs,
  sizingType: 'centrality',
  nodes: simpleNodes,
  edges: simpleEdges
};

const MinMaxSizesStory = (props) => (
  <GraphCanvas {...props} />
);

export const MinMaxSizes = MinMaxSizesStory.bind({});
MinMaxSizes.args = {
  ...commonArgs,
  sizingType: 'centrality',
  nodes: simpleNodes,
  edges: simpleEdges,
  minNodeSize: 10,
  maxNodeSize: 25
};

const PageRankStory = args => <GraphCanvas {...args} />;

export const PageRank = PageRankStory.bind({});
PageRank.args = {
  ...commonArgs,
  sizingType: 'pageRank',
  nodes: simpleNodes,
  edges: simpleEdges
};

const AttributeStory = args => <GraphCanvas {...args} />;

export const Attribute = AttributeStory.bind({});
Attribute.args = {
  ...commonArgs,
  sizingType: 'attribute',
  sizingAttribute: 'priority',
  minNodeSize: 2,
  maxNodeSize: 25,
  nodes: simpleNodes,
  edges: simpleEdges
};
