import React from 'react';
import { GraphCanvas } from '../../src';
import { complexEdges, complexNodes } from '../assets/demo';

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

/*
export const RadialOut = () => (
  <GraphCanvas layoutType="radialOut" nodes={simpleNodes} edges={simpleEdges} />
);

export const TreeLeftRight = () => (
  <GraphCanvas layoutType="treeLr" nodes={simpleNodes} edges={simpleEdges} />
);

export const TreeTopDown = () => (
  <GraphCanvas layoutType="treeTd" nodes={simpleNodes} edges={simpleEdges} />
);
*/
