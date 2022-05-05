import React from 'react';
import { GraphCanvas } from '../../src';
import { complexEdges, complexNodes, simpleEdges, simpleNodes } from '../assets/demo';

export default {
  title: 'Demos/Layouts',
  component: GraphCanvas
};

export const ForceDirected2d = () => (
  <GraphCanvas layoutType="forceDirected2d" nodes={complexNodes} edges={complexEdges} />
);

export const ForceDirected3d = () => (
  <GraphCanvas layoutType="forceDirected3d" nodes={complexNodes} edges={complexEdges} />
);

export const Circular2d = () => (
  <GraphCanvas layoutType="circular2d" nodes={complexNodes} edges={complexEdges} />
);

export const RadialOut3d = () => (
  <GraphCanvas layoutType="radialOut3d" nodes={simpleNodes} edges={simpleEdges} />
);

export const TreeLeftRight3d = () => (
  <GraphCanvas layoutType="treeLr3d" nodes={simpleNodes} edges={simpleEdges} />
);

export const TreeTopDown3d = () => (
  <GraphCanvas layoutType="treeTd3d" nodes={simpleNodes} edges={simpleEdges} />
);
