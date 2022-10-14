import React from 'react';
import { GraphCanvas } from '../../src';
import { simpleEdges, simpleNodes } from '../assets/demo';

export default {
  title: 'Demos/Edges/Curved',
  component: GraphCanvas
};

export const Curved = () => (
  <GraphCanvas
    nodes={simpleNodes}
    edges={simpleEdges}
    edgeArrowPosition="none"
    edgeInterpolation="curved"
    onEdgeClick={edge => alert(`Edge ${edge.id} clicked`)}
  />
);

export const CurvedArrowsEnd = () => (
  <GraphCanvas
    edgeArrowPosition="end"
    edgeInterpolation="curved"
    nodes={simpleNodes}
    edges={simpleEdges}
  />
);

export const CurvedArrowsMid = () => (
  <GraphCanvas
    edgeArrowPosition="mid"
    edgeInterpolation="curved"
    nodes={simpleNodes}
    edges={simpleEdges}
  />
);

export const CurvedSizes = () => (
  <GraphCanvas
    edgeInterpolation="curved"
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
        label: '1-2'
      },
      {
        source: '2',
        target: '3',
        id: '2-3',
        label: '2-3',
        size: 5
      },
      {
        source: '3',
        target: '4',
        id: '3-4',
        label: '3-4',
        size: 3
      },
      {
        source: '4',
        target: '5',
        id: '4-5',
        label: '4-5',
        size: 10
      }
    ]}
  />
);
