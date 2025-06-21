import React, { useRef } from 'react';
import { GraphCanvas, GraphCanvasRef, useSelection } from '../../src';
import { complexEdges, complexNodes } from '../assets/demo';
import { commonArgTypes, commonArgs } from '../shared/storybook-args';

export default {
  title: 'Demos/Highlight/Click',
  component: GraphCanvas,
  argTypes: commonArgTypes
};

const DirectStory = args => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const { selections, onNodeClick, onCanvasClick } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges
  });

  return (
    <GraphCanvas
      {...args}
      ref={graphRef}
      nodes={complexNodes}
      edges={complexEdges}
      selections={selections}
      onNodeClick={onNodeClick}
      onCanvasClick={onCanvasClick}
    />
  );
};

export const Direct = DirectStory.bind({});
Direct.args = {
  ...commonArgs
};
export const NoFocus = () => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const { selections, onNodeClick, onCanvasClick } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    focusOnSelect: false
  });

  return (
    <GraphCanvas
      ref={graphRef}
      nodes={complexNodes}
      edges={complexEdges}
      selections={selections}
      onCanvasClick={onCanvasClick}
      onNodeClick={onNodeClick}
    />
  );
};

export const Inwards = () => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const { selections, actives, onNodeClick, onCanvasClick } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    pathSelectionType: 'in'
  });

  return (
    <GraphCanvas
      ref={graphRef}
      nodes={complexNodes}
      edges={complexEdges}
      selections={selections}
      actives={actives}
      onCanvasClick={onCanvasClick}
      onNodeClick={onNodeClick}
    />
  );
};

export const Outwards = () => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const { selections, actives, onNodeClick, onCanvasClick } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    pathSelectionType: 'out'
  });

  return (
    <GraphCanvas
      ref={graphRef}
      nodes={complexNodes}
      edges={complexEdges}
      selections={selections}
      actives={actives}
      onCanvasClick={onCanvasClick}
      onNodeClick={onNodeClick}
    />
  );
};

export const All = () => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const { selections, actives, onNodeClick, onCanvasClick } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    pathSelectionType: 'all'
  });

  return (
    <GraphCanvas
      ref={graphRef}
      nodes={complexNodes}
      edges={complexEdges}
      selections={selections}
      actives={actives}
      onCanvasClick={onCanvasClick}
      onNodeClick={onNodeClick}
    />
  );
};
