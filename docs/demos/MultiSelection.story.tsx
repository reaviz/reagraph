import React, { Fragment, useRef } from 'react';
import { GraphCanvas, GraphCanvasRef, useSelection } from '../../src';
import { complexEdges, complexNodes } from '../assets/demo';

export default {
  title: 'Demos/Selection/Multi',
  component: GraphCanvas
};

export const Defaults = () => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const { selections, onNodeClick, onCanvasClick } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    type: 'multi',
    selections: [complexNodes[0].id, complexNodes[1].id]
  });

  return (
    <GraphCanvas
      ref={graphRef}
      nodes={complexNodes}
      edges={complexEdges}
      selections={selections}
      onNodeClick={onNodeClick}
      onCanvasClick={onCanvasClick}
    />
  );
};

export const Dragging = () => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const { selections, onNodeClick, onCanvasClick } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    type: 'multi'
  });

  return (
    <GraphCanvas
      draggable
      ref={graphRef}
      nodes={complexNodes}
      edges={complexEdges}
      selections={selections}
      onNodeClick={onNodeClick}
      onCanvasClick={onCanvasClick}
    />
  );
};

export const ModifierKey = () => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const { selections, onNodeClick, onCanvasClick } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    focusOnSelect: 'singleOnly',
    type: 'multiModifier'
  });

  return (
    <>
      <div
        style={{
          zIndex: 9,
          position: 'absolute',
          top: 0,
          right: 0,
          background: 'rgba(0, 0, 0, .5)',
          color: 'white'
        }}
      >
        <h3 style={{ margin: 5 }}>
          Hold Command/CTRL and Click to Select Multiples
        </h3>
      </div>
      <GraphCanvas
        ref={graphRef}
        nodes={complexNodes}
        edges={complexEdges}
        selections={selections}
        onNodeClick={onNodeClick}
        onCanvasClick={onCanvasClick}
      />
    </>
  );
};

export const PathFinding = () => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const { selections, actives, selectNodePaths, onNodeClick, onCanvasClick } =
    useSelection({
      ref: graphRef,
      nodes: complexNodes,
      edges: complexEdges,
      pathSelectionType: 'direct',
      type: 'multi'
    });

  const from = complexNodes[0].id;
  const to = complexNodes[8].id;

  return (
    <Fragment>
      <div
        style={{
          zIndex: 9,
          position: 'absolute',
          top: 15,
          right: 15,
          background: 'rgba(0, 0, 0, .5)',
          padding: 1,
          color: 'white'
        }}
      >
        <button
          style={{ display: 'block', width: '100%' }}
          onClick={() => selectNodePaths(from, to)}
        >
          Select {from} to {to} Paths
        </button>
      </div>
      <GraphCanvas
        ref={graphRef}
        actives={actives}
        nodes={complexNodes}
        edges={complexEdges}
        selections={selections}
        onCanvasClick={onCanvasClick}
        onNodeClick={onNodeClick}
      />
    </Fragment>
  );
};
