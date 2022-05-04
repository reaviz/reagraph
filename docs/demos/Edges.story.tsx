import React from 'react';
import { GraphCanvas } from '../../src';

export default {
  title: 'Demos/Edges',
  component: GraphCanvas
};

export const Sizes = () => (
  <GraphCanvas
    nodes={[{
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
    }]}
    edges={[{
      source: '1',
      target: '2',
      id: '1-2',
      label: '1-2'
    },
    {
      source: '2',
      target: '3',
      id: '2-3',
      label: '2-1',
      size: 5
    }]}
  />
);
