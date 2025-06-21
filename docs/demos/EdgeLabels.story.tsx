import React from 'react';
import { GraphCanvas } from '../../src';
import { commonArgTypes, commonArgs } from '../shared/storybook-args';

export default {
  title: 'Demos/Edges/Labels',
  component: GraphCanvas,
  argTypes: commonArgTypes
};

const AboveStory = args => (
  <GraphCanvas
    {...args}
    nodes={[
      {
        id: '1',
        label: '1'
      },
      {
        id: '2',
        label: '2'
      },
      {
        id: '3',
        label: '3'
      },
    ]}
    edges={[
      {
        source: '1',
        target: '2',
        id: '1-2',
        label: '1-2',
      },
      {
        source: '2',
        target: '3',
        id: '2-3',
        label: '2-3',
        size: 5,
      },
    ]}
  />
);

export const Above = AboveStory.bind({});
Above.args = {
  ...commonArgs,
  edgeLabelPosition: 'above',
  labelType: 'edges'
};

const BelowStory = args => (
  <GraphCanvas
    {...args}
    nodes={[
      {
        id: '1',
        label: '1'
      },
      {
        id: '2',
        label: '2'
      },
      {
        id: '3',
        label: '3'
      }
    ]}
    edges={[
      {
        source: '1',
        target: '2',
        id: '1-2',
        label: '1-2',
      },
      {
        source: '2',
        target: '3',
        id: '2-3',
        label: '2-3',
        size: 5,
      }
    ]}
  />
);

export const Below = BelowStory.bind({});
Below.args = {
  ...commonArgs,
  edgeLabelPosition: 'below',
  labelType: 'edges'
};

const InlineStory = args => (
  <GraphCanvas
    {...args}
    nodes={[
      {
        id: '1',
        label: '1'
      },
      {
        id: '2',
        label: '2'
      },
      {
        id: '3',
        label: '3'
      }
    ]}
    edges={[
      {
        source: '1',
        target: '2',
        id: '1-2',
        label: '1-2',
      },
      {
        source: '2',
        target: '3',
        id: '2-3',
        label: '2-3',
        size: 5,
      }
    ]}
  />
);

export const Inline = InlineStory.bind({});
Inline.args = {
  ...commonArgs,
  edgeLabelPosition: 'inline',
  labelType: 'edges'
};

const NaturalStory = args => (
  <GraphCanvas
    {...args}
    nodes={[
      {
        id: '1',
        label: '1'
      },
      {
        id: '2',
        label: '2'
      },
      {
        id: '3',
        label: '3'
      }
    ]}
    edges={[
      {
        source: '1',
        target: '2',
        id: '1-2',
        label: '1-2',
      },
      {
        source: '2',
        target: '3',
        id: '2-3',
        label: '2-3',
        size: 5,
      }
    ]}
  />
);

export const Natural = NaturalStory.bind({});
Natural.args = {
  ...commonArgs,
  edgeLabelPosition: 'natural',
  labelType: 'edges'
};
