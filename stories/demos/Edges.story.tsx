import React from 'react';
import { GraphCanvas } from '../../src';
import { simpleEdges, simpleNodes } from '../assets/demo';

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

export const Colors = () => (
  <GraphCanvas
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
        size: 3,
        fill: '#7f11e0'
      },
      {
        source: '2',
        target: '3',
        id: '2-3',
        label: '2-3',
        size: 3,
        fill: 'green'
      },
      {
        source: '3',
        target: '4',
        id: '3-4',
        label: '3-4',
        size: 3,
        fill: 'blue'
      },
      {
        source: '4',
        target: '5',
        id: '4-5',
        label: '4-5',
        size: 3,
        fill: 'red'
      }
    ]}
  />
);

export const Events = () => (
  <GraphCanvas
    nodes={simpleNodes}
    edges={simpleEdges}
    onEdgeClick={edge => alert(`Edge ${edge.id} clicked`)}
  />
);

export const Dashed = () => (
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
        label: '1-2',
        dashed: true,
      },
      {
        source: '2',
        target: '3',
        id: '2-3',
        label: '2-3',
        size: 5,
        dashed: true,
      },
      {
        source: '3',
        target: '4',
        id: '3-4',
        label: '3-4',
        size: 3,
        dashed: true,
      },
      {
        source: '4',
        target: '5',
        id: '4-5',
        label: '4-5',
        size: 10,
        dashed: true,
      }
    ]}
  />
);

export const DashedSizeAndColor = () => (
  <GraphCanvas
    edgeInterpolation="curved"
    labelType="all"
    animated={false}
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
        dashed: true,
        dashArray: [1, 1],
        fill: '#7f11e0'
      },
      {
        source: '2',
        target: '3',
        id: '2-3',
        label: '2-3',
        size: 5,
        dashed: true,
        dashArray: [3, 1],
        fill: 'green'
      },
      {
        source: '3',
        target: '4',
        id: '3-4',
        label: '3-4',
        size: 3,
        dashed: true,
        dashArray: [5, 5],
        fill: 'red'
      },
      {
        source: '4',
        target: '5',
        id: '4-5',
        label: '4-5',
        size: 10,
        dashed: true,
        dashArray: [7, 3],
        fill: 'blue'
      }
    ]}
  />
);

export const DashSize = () => (
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
        label: '1-2',
        dashed: true,
        dashArray: [1, 1]
      },
      {
        source: '2',
        target: '3',
        id: '2-3',
        label: '2-3',
        size: 5,
        dashed: true,
        dashArray: [3, 1]
      },
      {
        source: '3',
        target: '4',
        id: '3-4',
        label: '3-4',
        size: 3,
        dashed: true,
        dashArray: [5, 5]
      },
      {
        source: '4',
        target: '5',
        id: '4-5',
        label: '4-5',
        size: 10,
        dashed: true,
        dashArray: [7, 3]
      }
    ]}
  />
);
