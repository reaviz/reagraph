import React from 'react';
import { GraphCanvas } from '../../src';
import { simpleEdges, simpleNodes } from '../assets/demo';
import { commonArgTypes, commonArgs } from '../shared/storybook-args';

export default {
  title: 'Demos/Labels',
  component: GraphCanvas,
  argTypes: commonArgTypes
};

const AllStory = args => <GraphCanvas {...args} />;

export const All = AllStory.bind({});
All.args = {
  ...commonArgs,
  labelType: 'all',
  nodes: simpleNodes,
  edges: simpleEdges
};

const LongLabelsStory = args => (
  <GraphCanvas 
    {...args}
    nodes={[
      {
        id: '1',
        label: 'Department of Defense Logistics and Operations',
      },
      {
        id: '2',
        label: 'The Security Operations of the Cyber Defense System for the United States of America',
      }
    ]} 
    edges={[
      {
        id: '1-2',
        source: '1',
        target: '2',
        label: 'The Security Operations of the Cyber Defense System for the United States of America'
      }
    ]} 
  />
);

export const LongLabels = LongLabelsStory.bind({});
LongLabels.args = {
  ...commonArgs,
  labelType: 'all'
};

const NodesOnlyStory = args => <GraphCanvas {...args} />;

export const NodesOnly = NodesOnlyStory.bind({});
NodesOnly.args = {
  ...commonArgs,
  labelType: 'nodes',
  nodes: simpleNodes,
  edges: simpleEdges
};

const EdgesOnlyStory = args => <GraphCanvas {...args} />;

export const EdgesOnly = EdgesOnlyStory.bind({});
EdgesOnly.args = {
  ...commonArgs,
  labelType: 'edges',
  nodes: simpleNodes,
  edges: simpleEdges
};

const AutomaticStory = args => <GraphCanvas {...args} />;

export const Automatic = AutomaticStory.bind({});
Automatic.args = {
  ...commonArgs,
  labelType: 'auto',
  nodes: simpleNodes,
  edges: simpleEdges
};

const SubLabelsStory = args => (
  <GraphCanvas
    {...args}
    nodes={[{
      id: '1',
      label: 'Node 1',
      subLabel: 'SubLabel 1'
    },
    {
      id: '2',
      label: 'Node 2'
    },
    {
      id: '3',
      label: 'Node 3',
      subLabel: 'SubLabel 3'
    }]}
    edges={[{
      source: '1',
      target: '2',
      id: '1-2',
    },
    {
      source: '3',
      target: '1',
      id: '3-1',
    }]}
  />
);

export const SubLabels = SubLabelsStory.bind({});
SubLabels.args = {
  ...commonArgs
};
