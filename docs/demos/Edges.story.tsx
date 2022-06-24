import React from 'react';
import { GraphCanvas } from '../../src';

export default {
  title: 'Demos/Edges',
  component: GraphCanvas
};

export const Sizes = () => (
  <GraphCanvas
    labelType="all"
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
      {
        id: '4',
        label: '4'
      },
      {
        id: '5',
        label: '5'
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
      },
      {
        source: '3',
        target: '4',
        id: '3-4',
        label: '3-4',
        size: 3,
      },
      {
        source: '4',
        target: '5',
        id: '4-5',
        label: '4-5',
        size: 1,
      }]}
  />
);

export const LabelInside = () => (
  <GraphCanvas
    edgeLabelPosition="inside"
    labelType="edges"
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

export const LabelOutside = () => (
  <GraphCanvas
    edgeLabelPosition="outside"
    labelType="edges"
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
