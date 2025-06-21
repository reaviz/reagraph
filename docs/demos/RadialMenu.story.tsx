import React from 'react';
import { GraphCanvas, RadialMenu } from '../../src';
import { parentEdges, parentNodes, simpleEdges, simpleNodes } from '../assets/demo';
import { commonArgTypes, commonArgs } from '../shared/storybook-args';

export default {
  title: 'Demos/Context Menu/Radial',
  component: GraphCanvas,
  argTypes: commonArgTypes
};

const SimpleStory = args => (
  <GraphCanvas
    {...args}
    contextMenu={({ data, onClose }) => (
      <RadialMenu
        onClose={onClose}
        items={[
          {
            label: 'Add Node',
            onClick: () => {
              alert('Add a node');
              onClose();
            }
          },
          {
            label: 'Remove Node',
            onClick: () => {
              alert('Remove the node');
              onClose();
            }
          }
        ]}
      />
    )}
  />
);

export const Simple = SimpleStory.bind({});
Simple.args = {
  ...commonArgs,
  nodes: simpleNodes,
  edges: simpleEdges
};

const DisabledStory = args => (
  <GraphCanvas
    {...args}
    contextMenu={({ data, onClose }) => (
      <RadialMenu
        onClose={onClose}
        items={[
          {
            label: 'Add Node',
            disabled: true,
            onClick: () => {
              alert('Add a node');
              onClose();
            }
          },
          {
            label: 'Remove Node',
            disabled: true,
            onClick: () => {
              alert('Remove the node');
              onClose();
            }
          }
        ]}
      />
    )}
  />
);

export const Disabled = DisabledStory.bind({});
Disabled.args = {
  ...commonArgs,
  nodes: simpleNodes,
  edges: simpleEdges
};
