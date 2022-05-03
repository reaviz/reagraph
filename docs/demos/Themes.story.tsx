import React from 'react';
import { darkTheme, GraphCanvas } from '../../src';
import { simpleEdges, simpleNodes } from '../assets/demo';

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
        color: 'white',
        activeFill: '#1DE9AC',
        activeColor: '#1DE9AC'
      },
      edge: {
        fill: 'yellow',
        color: 'white',
        activeFill: '#1DE9AC',
        activeColor: '#1DE9AC'
      },
      ring: {
        fill: 'green',
        activeFill: '#1DE9AC'
      },
      arrow: {
        fill: 'green',
        activeFill: '#1DE9AC'
      }
    }}
    nodes={simpleNodes}
    edges={simpleEdges}
  />
);
