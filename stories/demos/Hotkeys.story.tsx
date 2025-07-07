import React, { useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'reakeys';
import {
  GraphCanvas,
  GraphCanvasRef,
  lightTheme,
  useSelection
} from '../../src';
import { complexEdges, complexNodes } from '../assets/demo';

export default {
  title: 'Demos/Hotkeys',
  component: GraphCanvas
};

export const CameraControls = () => {
  const graphRef = useRef<GraphCanvasRef | null>(null);

  const { selections, onNodeClick, onCanvasClick } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    type: 'multi',
    selections: []
  });

  const hotkeys = useHotkeys([
    {
      name: 'Zoom In',
      keys: 'mod+shift+i',
      action: 'keydown',
      category: 'Graph',
      callback: event => {
        event?.preventDefault();
        graphRef.current?.zoomIn();
      }
    },
    {
      name: 'Zoom Out',
      keys: 'mod+shift+o',
      action: 'keydown',
      category: 'Graph',
      callback: event => {
        event?.preventDefault();
        graphRef.current?.zoomOut();
      }
    },
    {
      name: 'Center',
      category: 'Graph',
      keys: 'mod+shift+c',
      action: 'keydown',
      callback: event => {
        event?.preventDefault();
        graphRef.current?.centerGraph(complexNodes.map(node => node.id));
      }
    }
  ]);

  return (
    <>
      <GraphCanvas
        ref={graphRef}
        nodes={complexNodes}
        edges={complexEdges}
        selections={selections}
        onNodeClick={onNodeClick}
        onCanvasClick={onCanvasClick}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          color: 'black',
          padding: '10px'
        }}
      >
        <h1>Hotkeys</h1>
        {hotkeys.map(hotkey => (
          <p key={hotkey.name}>
            {hotkey.name} - <strong>{hotkey.keys}</strong>
          </p>
        ))}
      </div>
    </>
  );
};

export const Selection = () => {
  const graphRef = useRef<GraphCanvasRef | null>(null);

  const {
    selections,
    setSelections,
    clearSelections,
    onNodeClick,
    onCanvasClick
  } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    type: 'multi',
    selections: [complexNodes[0].id, complexNodes[1].id]
  });

  const hotkeys = useHotkeys([
    {
      name: 'Select All',
      keys: 'mod+a',
      action: 'keydown',
      category: 'Graph',
      description: 'Select all nodes and edges',
      callback: event => {
        event?.preventDefault();
        setSelections(complexNodes.map(node => node.id));
      }
    },
    {
      name: 'Deselect Selections',
      category: 'Graph',
      description: 'Deselect selected nodes and edges',
      keys: 'escape',
      action: 'keydown',
      callback: event => {
        event?.preventDefault();
        clearSelections();
      }
    }
  ]);

  return (
    <>
      <GraphCanvas
        ref={graphRef}
        nodes={complexNodes}
        edges={complexEdges}
        selections={selections}
        onNodeClick={onNodeClick}
        onCanvasClick={onCanvasClick}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          color: 'black',
          padding: '10px'
        }}
      >
        <h1>Hotkeys</h1>
        {hotkeys.map(hotkey => (
          <p key={hotkey.name}>
            {hotkey.name} - <strong>{hotkey.keys}</strong>
          </p>
        ))}
      </div>
    </>
  );
};
