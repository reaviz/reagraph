import React, { Fragment, useEffect, useRef } from 'react';
import { GraphCanvas, GraphCanvasRef, useSelection } from '../../src';
import { complexEdges, complexNodes } from '../assets/demo';

export default {
  title: 'Demos/Selection',
  component: GraphCanvas
};

export const SingleDefault = () => (
  <GraphCanvas
    nodes={complexNodes}
    edges={complexEdges}
    selections={[complexNodes[0].id]}
  />
);

export const MultipleDefaults = () => (
  <GraphCanvas
    nodes={complexNodes}
    edges={complexEdges}
    selections={[complexNodes[0].id, complexNodes[1].id]}
  />
);

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

export const Simple = () => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const { selections, onNodeClick, onCanvasClick } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges
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

export const Dragging = () => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const { selections, onNodeClick, onCanvasClick } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges
  });

  return (
    <GraphCanvas
      ref={graphRef}
      draggable
      nodes={complexNodes}
      edges={complexEdges}
      selections={selections}
      onCanvasClick={onCanvasClick}
      onNodeClick={onNodeClick}
    />
  );
};

export const PathFinding = () => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const { selections, selectNodePaths, onNodeClick, onCanvasClick } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges
  });

  const from = complexNodes[0].id;
  const to = complexNodes[8].id;

  return (
    <Fragment>
      <div style={{ zIndex: 9, position: 'absolute', top: 15, right: 15, background: 'rgba(0, 0, 0, .5)', padding: 1, color: 'white' }}>
        <button style={{ display: 'block', width: '100%' }} onClick={() => selectNodePaths(from, to)}>
          Select {from} to {to} Paths
        </button>
      </div>
      <GraphCanvas
        ref={graphRef}
        nodes={complexNodes}
        edges={complexEdges}
        selections={selections}
        onCanvasClick={onCanvasClick}
        onNodeClick={onNodeClick}
      />
    </Fragment>
  );
};
