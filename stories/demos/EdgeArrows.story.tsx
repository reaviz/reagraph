import React from 'react';

import { GraphCanvas } from '../../src';
import { simpleEdges, simpleNodes } from '../assets/demo';

export default {
  title: 'Demos/Edges/Arrows',
  component: GraphCanvas
};

export const End = () => (
  <GraphCanvas
    edgeArrowPosition="end"
    nodes={simpleNodes}
    edges={simpleEdges}
  />
);

export const Mid = () => (
  <GraphCanvas
    edgeArrowPosition="mid"
    nodes={simpleNodes}
    edges={simpleEdges}
  />
);

export const None = () => (
  <GraphCanvas
    edgeArrowPosition="none"
    nodes={simpleNodes}
    edges={simpleEdges}
  />
);

export const IndividualPlacement = () => (
  <GraphCanvas
    nodes={[
      {
        id: '1',
        label: 'Node'
      },
      {
        id: '2',
        label: 'Mid Arrow'
      },
      {
        id: '3',
        label: 'End Arrow'
      },
      {
        id: '4',
        label: 'No Arrow'
      }
    ]}
    edges={[
      {
        source: '1',
        target: '2',
        id: '1-2',
        label: '1-2',
        arrowPlacement: 'mid'
      },
      {
        source: '1',
        target: '3',
        id: '1-3',
        label: '1-3'
      },
      {
        source: '3',
        target: '4',
        id: '3-4',
        label: '3-4',
        arrowPlacement: 'none'
      }
    ]}
  />
);
