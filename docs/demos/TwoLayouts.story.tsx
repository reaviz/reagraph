import React from 'react';
import { GraphCanvas } from '../../src';
import { complexEdges, complexNodes, simpleEdges, simpleNodes, treeEdges } from '../assets/demo';
import { commonArgTypes, commonArgs } from '../shared/storybook-args';

export default {
  title: 'Demos/Layouts/2D',
  component: GraphCanvas,
  argTypes: commonArgTypes
};

const ForceDirectedStory = args => <GraphCanvas {...args} />;

export const ForceDirected = ForceDirectedStory.bind({});
ForceDirected.args = {
  ...commonArgs,
  layoutType: 'forceDirected2d',
  nodes: complexNodes,
  edges: complexEdges
};

const HierarchicalTopDownStory = args => <GraphCanvas {...args} />;

export const HierarchicalTopDown = HierarchicalTopDownStory.bind({});
HierarchicalTopDown.args = {
  ...commonArgs,
  layoutType: 'hierarchicalTd',
  nodes: simpleNodes,
  edges: treeEdges
};

const HierarchicalLeftRightStory = args => <GraphCanvas {...args} />;

export const HierarchicalLeftRight = HierarchicalLeftRightStory.bind({});
HierarchicalLeftRight.args = {
  ...commonArgs,
  layoutType: 'hierarchicalLr',
  nodes: simpleNodes,
  edges: treeEdges
};

const CircularStory = args => <GraphCanvas {...args} />;

export const Circular = CircularStory.bind({});
Circular.args = {
  ...commonArgs,
  layoutType: 'circular2d',
  nodes: complexNodes,
  edges: complexEdges
};

const NoOverlapStory = args => <GraphCanvas {...args} />;

export const NoOverlap = NoOverlapStory.bind({});
NoOverlap.args = {
  ...commonArgs,
  layoutType: 'nooverlap',
  nodes: simpleNodes,
  edges: simpleEdges
};

const ForceAtlas2Story = args => <GraphCanvas {...args} />;

export const ForceAtlas2 = ForceAtlas2Story.bind({});
ForceAtlas2.args = {
  ...commonArgs,
  layoutType: 'forceatlas2',
  nodes: complexNodes,
  edges: complexEdges
};

const RadialOutStory = args => <GraphCanvas {...args} />;

export const RadialOut = RadialOutStory.bind({});
RadialOut.args = {
  ...commonArgs,
  layoutType: 'radialOut2d',
  nodes: simpleNodes,
  edges: simpleEdges
};

const TreeLeftRightStory = args => <GraphCanvas {...args} />;

export const TreeLeftRight = TreeLeftRightStory.bind({});
TreeLeftRight.args = {
  ...commonArgs,
  layoutType: 'treeLr2d',
  nodes: simpleNodes,
  edges: treeEdges
};

const TreeTopDownStory = args => <GraphCanvas {...args} />;

export const TreeTopDown = TreeTopDownStory.bind({});
TreeTopDown.args = {
  ...commonArgs,
  layoutType: 'treeTd2d',
  nodes: simpleNodes,
  edges: treeEdges
};
