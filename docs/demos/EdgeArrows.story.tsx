import React from 'react';
import { GraphCanvas } from '../../src';
import { simpleEdges, simpleNodes } from '../assets/demo';
import { commonArgTypes, commonArgs } from '../shared/storybook-args';

export default {
  title: 'Demos/Edges/Arrows',
  component: GraphCanvas,
  argTypes: commonArgTypes
};

const EndStory = args => <GraphCanvas {...args} />;
export const End = EndStory.bind({});
End.args = {
  ...commonArgs,
  edgeArrowPosition: 'end',
  nodes: simpleNodes,
  edges: simpleEdges
};

const MidStory = args => <GraphCanvas {...args} />;
export const Mid = MidStory.bind({});
Mid.args = {
  ...commonArgs,
  edgeArrowPosition: 'mid',
  nodes: simpleNodes,
  edges: simpleEdges
};

const NoneStory = args => <GraphCanvas {...args} />;
export const None = NoneStory.bind({});
None.args = {
  ...commonArgs,
  edgeArrowPosition: 'none',
  nodes: simpleNodes,
  edges: simpleEdges
};
