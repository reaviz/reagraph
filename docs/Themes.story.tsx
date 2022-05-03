import React from 'react';
import { darkTheme, GraphCanvas } from '../src';
import { simpleEdges, simpleNodes } from './assets/demo';

export default {
  title: 'Demos/Themes',
  component: GraphCanvas
};

export const DarkTheme = () => (
  <GraphCanvas
    theme={darkTheme}
    nodes={simpleNodes}
    edges={simpleEdges}
  />
);

export const CustomTheme = () => (
  <GraphCanvas
    theme={{
      backgroundColor: 'gray',
      node: {
        fill: 'blue',
        color: 'white'
      },
      edge: {
        fill: 'yellow',
        color: 'white'
      },
      arrow: {
        fill: 'green'
      }
    }}
    nodes={simpleNodes}
    edges={simpleEdges}
  />
);
