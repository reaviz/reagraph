import { lightTheme, darkTheme } from '../../src';

export const commonArgTypes = {
  // Layout & Positioning
  layoutType: {
    control: { type: 'select' },
    options: [
      'forceDirected2d',
      'forceDirected3d', 
      'circular2d',
      'treeTd2d',
      'treeTd3d',
      'treeLr2d', 
      'treeLr3d',
      'radialOut2d',
      'radialOut3d',
      'hierarchicalTd',
      'hierarchicalLr',
      'nooverlap',
      'forceatlas2',
      'custom'
    ],
    description: 'Layout algorithm to use for positioning nodes'
  },
  
  cameraMode: {
    control: { type: 'select' },
    options: ['pan', 'rotate', 'orbit'],
    description: 'Camera interaction mode'
  },
  
  animated: {
    control: { type: 'boolean' },
    description: 'Enable/disable animations'
  },

  // Visual Properties
  theme: {
    control: { type: 'select' },
    options: {
      'Light Theme': lightTheme,
      'Dark Theme': darkTheme
    },
    mapping: {
      'Light Theme': lightTheme,
      'Dark Theme': darkTheme
    },
    description: 'Theme to apply to the graph'
  },

  sizingType: {
    control: { type: 'select' },
    options: ['none', 'centrality', 'attribute', 'pageRank', 'default'],
    description: 'Node sizing strategy'
  },

  labelType: {
    control: { type: 'select' },
    options: ['none', 'auto', 'all', 'nodes', 'edges'],
    description: 'Label visibility strategy'
  },

  edgeLabelPosition: {
    control: { type: 'select' },
    options: ['above', 'below', 'inline', 'natural'],
    description: 'Position of edge labels relative to edges'
  },

  edgeArrowPosition: {
    control: { type: 'select' },
    options: ['end', 'start', 'middle'],
    description: 'Position of arrows on edges'
  },

  edgeInterpolation: {
    control: { type: 'select' },
    options: ['linear', 'curved'],
    description: 'Edge curve type'
  },

  // Node & Edge Properties
  defaultNodeSize: {
    control: { type: 'range', min: 1, max: 50, step: 1 },
    description: 'Default size for nodes'
  },

  minNodeSize: {
    control: { type: 'range', min: 1, max: 20, step: 1 },
    description: 'Minimum node size when using sizing strategies'
  },

  maxNodeSize: {
    control: { type: 'range', min: 10, max: 100, step: 1 },
    description: 'Maximum node size when using sizing strategies'
  },

  sizingAttribute: {
    control: { type: 'text' },
    description: 'Attribute name for attribute-based node sizing'
  },

  clusterAttribute: {
    control: { type: 'text' },
    description: 'Attribute name for node clustering'
  },

  // Interaction
  disabled: {
    control: { type: 'boolean' },
    description: 'Disable all graph interactions'
  },

  draggable: {
    control: { type: 'boolean' },
    description: 'Allow nodes to be dragged'
  },

  lassoType: {
    control: { type: 'select' },
    options: ['all', 'node', 'edge'],
    description: 'Type of lasso selection behavior'
  },

  // Advanced
  labelFontUrl: {
    control: { type: 'text' },
    description: 'URL to custom font for labels'
  },

  maxDistance: {
    control: { type: 'range', min: 1000, max: 100000, step: 1000 },
    description: 'Maximum camera distance'
  },

  minDistance: {
    control: { type: 'range', min: 100, max: 5000, step: 100 },
    description: 'Minimum camera distance'
  }
};

export const commonArgs = {
  layoutType: 'forceDirected2d',
  cameraMode: 'pan',
  animated: true,
  theme: lightTheme,
  sizingType: 'none',
  labelType: 'auto',
  edgeLabelPosition: 'natural',
  edgeArrowPosition: 'end',
  edgeInterpolation: 'linear',
  defaultNodeSize: 7,
  minNodeSize: 5,
  maxNodeSize: 25,
  sizingAttribute: '',
  clusterAttribute: '',
  disabled: false,
  draggable: false,
  lassoType: 'all',
  labelFontUrl: '',
  maxDistance: 50000,
  minDistance: 1000
};