import React, { useMemo } from 'react';
import { GraphCanvas } from '../../src';
import { transformGenerator } from '../assets/demo';
import generators from 'ngraph.generators';
import { range } from 'd3-array';

export default {
  title: 'Demos/Data',
  component: GraphCanvas
};

export const BalancedBinTree = () => {
  const [balancedBinTreeNodes, balancedBinTreeEdges] = useMemo(() => transformGenerator(generators.balancedBinTree(5)), []);
  return (
    <GraphCanvas nodes={balancedBinTreeNodes} edges={balancedBinTreeEdges} />
  );
};

export const Grid = () => {
  const [gridNodes, gridEdges] = useMemo(() => transformGenerator(generators.grid(5, 5)), []);
  return (
    <GraphCanvas nodes={gridNodes} edges={gridEdges} />
  );
};

export const WattsStrogatz = () => {
  const [wattsNodes, wattsEdges] = useMemo(() => transformGenerator(generators.wattsStrogatz(100, 4, 0.02)), []);
  return (
    <GraphCanvas nodes={wattsNodes} edges={wattsEdges} />
  );
};

export const Ladder = () => {
  const [ladderNodes, ladderEdges] = useMemo(() => transformGenerator(generators.ladder(5)), []);
  return (
    <GraphCanvas nodes={ladderNodes} edges={ladderEdges} />
  );
};

export const OneKNodes = () => {
  const nodes = useMemo(() => range(1000).map(i => ({ id: `node-${i}`, label: `Node ${i}` })), []);
  return (
    <GraphCanvas nodes={nodes} edges={[]} />
  );
};
