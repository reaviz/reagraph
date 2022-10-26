import React, { Fragment, useRef } from 'react';
import { GraphCanvas, GraphCanvasRef, useSelection } from '../../src';
import { complexEdges, complexNodes } from '../assets/demo';

export default {
  title: 'Demos/Selection/Lasso',
  component: GraphCanvas
};

export const NodesAndEdges = () => {
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
        ref={graphRef}
        nodes={complexNodes}
        edges={complexEdges}
        selections={selections}
        actives={actives}
        onNodeClick={onNodeClick}
        onCanvasClick={onCanvasClick}
        lassoType="all"
        onLasso={onLasso}
        onLassoEnd={onLassoEnd}
      />
    </>
  );
};

export const NodesOnly = () => {
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
        ref={graphRef}
        nodes={complexNodes}
        edges={complexEdges}
        selections={selections}
        actives={actives}
        onNodeClick={onNodeClick}
        onCanvasClick={onCanvasClick}
        lassoType="node"
        onLasso={onLasso}
        onLassoEnd={onLassoEnd}
      />
    </>
  );
};

export const Dragging = () => {
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
        ref={graphRef}
        nodes={complexNodes}
        draggable
        edges={complexEdges}
        selections={selections}
        actives={actives}
        onNodeClick={onNodeClick}
        onCanvasClick={onCanvasClick}
        lassoType="node"
        onLasso={onLasso}
        onLassoEnd={onLassoEnd}
      />
    </>
  );
};

export const EdgesOnly = () => {
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
        ref={graphRef}
        nodes={complexNodes}
        edges={complexEdges}
        selections={selections}
        actives={actives}
        onNodeClick={onNodeClick}
        onCanvasClick={onCanvasClick}
        lassoType="edge"
        onLasso={onLasso}
        onLassoEnd={onLassoEnd}
      />
    </>
  );
};
