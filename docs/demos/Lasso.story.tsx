import React, { Fragment, useRef } from 'react';
import { GraphCanvas, GraphCanvasRef, useSelection } from '../../src';
import { complexEdges, complexNodes } from '../assets/demo';
import { commonArgTypes, commonArgs } from '../shared/storybook-args';

export default {
  title: 'Demos/Selection/Lasso',
  component: GraphCanvas,
  argTypes: commonArgTypes
};

const NodesAndEdgesTemplate = (args) => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const { actives, selections, onNodeClick, onCanvasClick, onLasso, onLassoEnd } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    type: 'multi'
  });

  return (
    <>
      <div style={{ zIndex: 9, userSelect: 'none', position: 'absolute', top: 0, right: 0, background: 'rgba(0, 0, 0, .5)', color: 'white' }}>
        <h3 style={{ margin: 5 }}>Hold Shift and Drag to Lasso</h3>
      </div>
      <GraphCanvas
        {...args}
        ref={graphRef}
        nodes={complexNodes}
        edges={complexEdges}
        selections={selections}
        actives={actives}
        onNodeClick={onNodeClick}
        onCanvasClick={onCanvasClick}
        onLasso={onLasso}
        onLassoEnd={onLassoEnd}
      />
    </>
  );
};

export const NodesAndEdges = NodesAndEdgesTemplate.bind({});
NodesAndEdges.args = {
  ...commonArgs,
  lassoType: 'all'
};

const NodesOnlyTemplate = (args) => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const { actives, selections, onNodeClick, onCanvasClick, onLasso, onLassoEnd } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    type: 'multi'
  });

  return (
    <>
      <div style={{ zIndex: 9, userSelect: 'none', position: 'absolute', top: 0, right: 0, background: 'rgba(0, 0, 0, .5)', color: 'white' }}>
        <h3 style={{ margin: 5 }}>Hold Shift and Drag to Lasso</h3>
      </div>
      <GraphCanvas
        {...args}
        ref={graphRef}
        nodes={complexNodes}
        edges={complexEdges}
        selections={selections}
        actives={actives}
        onNodeClick={onNodeClick}
        onCanvasClick={onCanvasClick}
        onLasso={onLasso}
        onLassoEnd={onLassoEnd}
      />
    </>
  );
};

export const NodesOnly = NodesOnlyTemplate.bind({});
NodesOnly.args = {
  ...commonArgs,
  lassoType: 'node'
};

const DraggingTemplate = (args) => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const { actives, selections, onNodeClick, onCanvasClick, onLasso, onLassoEnd } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    type: 'multi'
  });

  return (
    <>
      <div style={{ zIndex: 9, userSelect: 'none', position: 'absolute', top: 0, right: 0, background: 'rgba(0, 0, 0, .5)', color: 'white' }}>
        <h3 style={{ margin: 5 }}>Hold Shift and Drag to Lasso</h3>
      </div>
      <GraphCanvas
        {...args}
        ref={graphRef}
        nodes={complexNodes}
        edges={complexEdges}
        selections={selections}
        actives={actives}
        onNodeClick={onNodeClick}
        onCanvasClick={onCanvasClick}
        onLasso={onLasso}
        onLassoEnd={onLassoEnd}
      />
    </>
  );
};

export const Dragging = DraggingTemplate.bind({});
Dragging.args = {
  ...commonArgs,
  draggable: true,
  lassoType: 'node'
};

const EdgesOnlyTemplate = (args) => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const { actives, selections, onNodeClick, onCanvasClick, onLasso, onLassoEnd } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    type: 'multi'
  });

  return (
    <>
      <div style={{ zIndex: 9, userSelect: 'none', position: 'absolute', top: 0, right: 0, background: 'rgba(0, 0, 0, .5)', color: 'white' }}>
        <h3 style={{ margin: 5 }}>Hold Shift and Drag to Lasso</h3>
      </div>
      <GraphCanvas
        {...args}
        ref={graphRef}
        nodes={complexNodes}
        edges={complexEdges}
        selections={selections}
        actives={actives}
        onNodeClick={onNodeClick}
        onCanvasClick={onCanvasClick}
        onLasso={onLasso}
        onLassoEnd={onLassoEnd}
      />
    </>
  );
};

export const EdgesOnly = EdgesOnlyTemplate.bind({});
EdgesOnly.args = {
  ...commonArgs,
  lassoType: 'edge'
};
