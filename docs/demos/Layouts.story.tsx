import React from 'react';
import { CustomLayoutInputs, GraphCanvas, NodePositionArgs, recommendLayout } from '../../src';
import { complexEdges, complexNodes, simpleEdges, simpleNodes } from '../assets/demo';
import { commonArgTypes, commonArgs } from '../shared/storybook-args';

export default {
  title: 'Demos/Layouts',
  component: GraphCanvas,
  argTypes: commonArgTypes
};

const RecommenderStory = args => {
  const layout = recommendLayout(complexNodes, complexEdges);

  return (
    <GraphCanvas
      {...args}
      layoutType={layout}
    />
  );
};

export const Recommender = RecommenderStory.bind({});
Recommender.args = {
  ...commonArgs,
  nodes: complexNodes,
  edges: complexEdges
};

const OverridesStory = args => (
  <GraphCanvas
    {...args}
    layoutOverrides={{
      nodeStrength: -50,
      linkDistance: 500
    }}
  />
);

export const Overrides = OverridesStory.bind({});
Overrides.args = {
  ...commonArgs,
  layoutType: 'forceDirected2d',
  nodes: complexNodes,
  edges: complexEdges
};

const CustomStory = args => (
  <GraphCanvas
    {...args}
    layoutOverrides={{
      getNodePosition: (id: string, { nodes }: NodePositionArgs) => {
        const idx = nodes.findIndex(n => n.id === id);
        const node = nodes[idx];
        return {
          x: 25 * idx,
          y: idx % 2 === 0 ? 0 : 50,
          z: 1
        };
      }
    } as CustomLayoutInputs}
  />
);

export const Custom = CustomStory.bind({});
Custom.args = {
  ...commonArgs,
  layoutType: 'custom',
  nodes: simpleNodes,
  edges: simpleEdges
};
