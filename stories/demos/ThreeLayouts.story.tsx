import { range } from 'd3-array';
import React from 'react';
import { GraphCanvas } from '../../src';
import { complexEdges, complexNodes, simpleEdges, simpleNodes } from '../assets/demo';

export default {
  title: 'Demos/Layouts/3D',
  component: GraphCanvas
};

/**
 * Calculate concentric level based on current index, total nodes, and growth ratio.
 * @param current
 * @param total
 * @param ratio
 */
function getConcentricLevel(current, total, ratio) {
  let level = 1;
  let levelSize = 20;
  let covered = 0;

  while (covered + levelSize < current && covered < total) {
    covered += levelSize;
    levelSize = Math.floor(levelSize * ratio); // grow geometrically
    level++;
  }

  return level;
}

export const ForceDirected = () => (
  <GraphCanvas layoutType="forceDirected3d" nodes={complexNodes} edges={complexEdges} />
);

export const RadialOut = () => (
  <GraphCanvas layoutType="radialOut3d" nodes={simpleNodes} edges={simpleEdges} />
);

export const TreeLeftRight = () => (
  <GraphCanvas layoutType="treeLr3d" nodes={simpleNodes} edges={simpleEdges} />
);

export const TreeTopDown = () => (
  <GraphCanvas layoutType="treeTd3d" nodes={simpleNodes} edges={simpleEdges} />
);

export const Concentric = () => (
  <GraphCanvas layoutType="concentric3d" nodes={range(300).map(i => ({
    id: `${i}`,
    label: `Node ${i}`,
    fill: `hsl(${getConcentricLevel(i, 300, 7) * 100}, 100%, 50%)`,
    data: { level: getConcentricLevel(i, 300, 7)}
  }))} edges={complexEdges} />
);
