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
    labelType="all"
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

const CustomThemeStory = (args) => (
  <GraphCanvas
    {...args}
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

export const CustomTheme = CustomThemeStory.bind({});
CustomTheme.args = {
  theme: {
    canvas: {
      background: '#1E2026',
      fog: '#1E2026'
    },
    node: {
      fill: '#7A8C9E',
      activeFill: '#1DE9AC',
      label: {
        stroke: '#1E2026',
        color: '#ACBAC7',
        activeColor: '#1DE9AC',
      }
    },
    menu: {
      background: '#54616D',
      border: '#7A8C9E',
      color: '#fff',
      activeBackground: '#1DE9AC',
      activeColor: '#000'
    },
    ring: {
      fill: '#54616D',
      activeFill: '#1DE9AC'
    },
    edge: {
      fill: '#54616D',
      activeFill: '#1DE9AC',
      label: {
        stroke: '#1E2026',
        color: '#ACBAC7',
        activeColor: '#1DE9AC',
      }
    },
    arrow: {
      fill: '#54616D',
      activeFill: '#1DE9AC'
    }
  }
};
