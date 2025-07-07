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

export const HierarchicalTopDown = () => (
  <GraphCanvas layoutType="hierarchicalTd" nodes={simpleNodes} edges={treeEdges} />
);

export const HierarchicalLeftRight = () => (
  <GraphCanvas layoutType="hierarchicalLr" nodes={simpleNodes} edges={treeEdges} />
);

export const Circular = () => (
  <GraphCanvas layoutType="circular2d" nodes={complexNodes} edges={complexEdges} />
);

export const NoOverlap = () => (
  <GraphCanvas layoutType="nooverlap" nodes={simpleNodes} edges={simpleEdges} />
);

export const ForceAtlas2 = () => (
  <GraphCanvas layoutType="forceatlas2" nodes={complexNodes} edges={complexEdges} />
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
