import React from 'react';
import { GraphCanvas, recommendLayout } from '../../src';
import { complexEdges, complexNodes } from '../assets/demo';

export default {
  title: 'Demos/Layouts',
  component: GraphCanvas
};

export const Recommender = () => {
  // TODO: Make this demo better
  const layout = recommendLayout(complexNodes, complexEdges);

  return (
    <GraphCanvas
      layoutType={layout}
      nodes={complexNodes}
      edges={complexEdges}
    />
  );
};

export const Overrides = () => (
  <GraphCanvas
    layoutType="forceDirected2d"
    layoutOverrides={{
      nodeStrength: -50,
      linkDistance: 500
    }}
    nodes={complexNodes}
    edges={complexEdges}
  />
);
