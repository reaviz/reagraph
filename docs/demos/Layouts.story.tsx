import React from 'react';
import { GraphCanvas } from '../../src';
import { simpleEdges, simpleNodes } from '../assets/demo';

export default {
  title: 'Demos/Layouts',
  component: GraphCanvas
};

export const ForceDirected2d = () => (
  <GraphCanvas layoutType="forceDirected2d" nodes={simpleNodes} edges={simpleEdges} />
);

export const ForceDirected3d = () => (
  <GraphCanvas layoutType="forceDirected3d" nodes={simpleNodes} edges={simpleEdges} />
);

export const Circular2d = () => (
  <GraphCanvas layoutType="circular2d" nodes={simpleNodes} edges={simpleEdges} />
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
