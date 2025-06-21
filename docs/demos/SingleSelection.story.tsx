import React, { useRef } from 'react';
import { GraphCanvas, GraphCanvasRef, useSelection } from '../../src';
import { complexEdges, complexNodes, simpleEdges, simpleNodes } from '../assets/demo';
import { commonArgTypes, commonArgs } from '../shared/storybook-args';

export default {
  title: 'Demos/Selection/Single',
  component: GraphCanvas,
  argTypes: commonArgTypes
};

const DefaultsTemplate = (args) => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const { selections, onNodeClick, onCanvasClick } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    selections: [complexNodes[0].id],
    type: 'single'
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

export const Defaults = DefaultsTemplate.bind({});
Defaults.args = {
  ...commonArgs
};

const SimpleTemplate = (args) => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const { selections, onNodeClick, onCanvasClick } = useSelection({
    ref: graphRef,
    nodes: simpleNodes,
    edges: simpleEdges,
    type: 'single'
  });

  return (
    <GraphCanvas
      {...args}
      ref={graphRef}
      nodes={simpleNodes}
      edges={simpleEdges}
      selections={selections}
      onCanvasClick={onCanvasClick}
      onNodeClick={onNodeClick}
    />
  );
};

export const Simple = SimpleTemplate.bind({});
Simple.args = {
  ...commonArgs
};

const DraggingTemplate = (args) => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const { selections, onNodeClick, onCanvasClick } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    type: 'single'
  });

  return (
    <GraphCanvas
      {...args}
      ref={graphRef}
      nodes={complexNodes}
      edges={complexEdges}
      selections={selections}
      onCanvasClick={onCanvasClick}
      onNodeClick={onNodeClick}
    />
  );
};

export const Dragging = DraggingTemplate.bind({});
Dragging.args = {
  ...commonArgs,
  draggable: true
};
