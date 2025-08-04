import React from 'react';
import { GraphCanvas, NodePositionArgs, recommendLayout, LayoutFactoryProps } from '../../src';
import { complexEdges, complexNodes, simpleEdges, simpleNodes } from '../assets/demo';

export default {
  title: 'Demos/Layouts',
  component: GraphCanvas
};

export const Recommender = () => {
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

export const Custom = () => (
  <GraphCanvas
    layoutType="custom"
    layoutOverrides={{
      getNodePosition: (id: string, { nodes }: NodePositionArgs) => {
        const idx = nodes.findIndex(n => n.id === id);
        return {
          x: 25 * idx,
          y: idx % 2 === 0 ? 0 : 50,
          z: 1
        };
      }
    } as LayoutFactoryProps}
    nodes={simpleNodes}
    edges={simpleEdges}
  />
);
