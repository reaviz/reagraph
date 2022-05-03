import React from 'react';
import { GraphCanvas } from '../src';
import { complexEdges, complexNodes } from './assets/demo';

export default {
  title: 'Demos/Selection',
  component: GraphCanvas
};

export const DefaultSelection = () => (
  <GraphCanvas
    nodes={complexNodes}
    edges={complexEdges}
    selections={[complexNodes[0].id]}
  />
);
