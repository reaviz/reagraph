import React from 'react';
import { GraphCanvas } from '../../src';
import { simpleEdges, simpleNodes } from '../assets/demo';

export default {
  title: 'Demos/Menu',
  component: GraphCanvas
};

export const Radial = () => (
  <GraphCanvas
    nodes={simpleNodes}
    edges={simpleEdges}
    contextMenuItems={[
      {
        label: 'Add Node',
        onClick: () => alert('Add a node')
      },
      {
        label: 'Remove Node',
        onClick: () => alert('Remove the node')
      }
    ]}
  />
);
