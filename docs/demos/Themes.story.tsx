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

export const CustomTheme = () => (
  <GraphCanvas
    theme={{
      canvas: {
        background: 'gray',
        fog: '000000'
      },
      node: {
        fill: 'blue',
        color: 'white',
        activeFill: '#1DE9AC',
        activeColor: '#1DE9AC'
      },
      menu: {
        background: '#FFF',
        border: '#AACBD2',
        color: '#000',
        activeBackground: '#1DE9AC',
        activeColor: '#FFF'
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
