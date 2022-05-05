import React from 'react';
import { GraphCanvas } from '../../src';
import { complexEdges, complexNodes, simpleEdges, simpleNodes, treeEdges } from '../assets/demo';

export default {
  title: 'Demos/Layouts/2D',
  component: GraphCanvas
};

export const ForceDirected = () => (
  <GraphCanvas layoutType="forceDirected2d" nodes={complexNodes} edges={complexEdges} />
);

export const Circular = () => (
  <GraphCanvas layoutType="circular2d" nodes={complexNodes} edges={complexEdges} />
);

export const RadialOut = () => (
  <GraphCanvas layoutType="radialOut2d" nodes={simpleNodes} edges={simpleEdges} />
);

export const TreeLeftRight = () => (
  <GraphCanvas layoutType="treeLr2d" nodes={simpleNodes} edges={treeEdges} />
);

export const TreeTopDown = () => (
  <GraphCanvas layoutType="treeTd2d" nodes={simpleNodes} edges={treeEdges} />
);
