import React from 'react';
import { GraphCanvas } from '../../src';
import { complexEdges, complexNodes, simpleEdges, simpleNodes } from '../assets/demo';
import { commonArgTypes, commonArgs } from '../shared/storybook-args';

export default {
  title: 'Demos/Layouts/3D',
  component: GraphCanvas,
  argTypes: commonArgTypes
};

const ForceDirectedStory = args => <GraphCanvas {...args} />;

export const ForceDirected = ForceDirectedStory.bind({});
ForceDirected.args = {
  ...commonArgs,
  layoutType: 'forceDirected3d',
  nodes: complexNodes,
  edges: complexEdges
};

const RadialOutStory = args => <GraphCanvas {...args} />;

export const RadialOut = RadialOutStory.bind({});
RadialOut.args = {
  ...commonArgs,
  layoutType: 'radialOut3d',
  nodes: simpleNodes,
  edges: simpleEdges
};

const TreeLeftRightStory = args => <GraphCanvas {...args} />;

export const TreeLeftRight = TreeLeftRightStory.bind({});
TreeLeftRight.args = {
  ...commonArgs,
  layoutType: 'treeLr3d',
  nodes: simpleNodes,
  edges: simpleEdges
};

const TreeTopDownStory = args => <GraphCanvas {...args} />;

export const TreeTopDown = TreeTopDownStory.bind({});
TreeTopDown.args = {
  ...commonArgs,
  layoutType: 'treeTd3d',
  nodes: simpleNodes,
  edges: simpleEdges
};
