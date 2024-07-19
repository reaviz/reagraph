import React, { useRef } from 'react';
import { GraphCanvas, GraphCanvasRef, Theme, useSelection } from '../../src';
import { complexEdges, complexNodes } from '../assets/demo';

export default {
  title: 'Demos/Highlight/Click',
  component: GraphCanvas
};

export const Direct = () => {
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
      onNodeClick={onNodeClick}
      onCanvasClick={onCanvasClick}
    />
  );
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

export const AllCustom = () => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const { selections, actives, onNodeClick, onCanvasClick } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    pathSelectionType: 'all'
  });
  const theme: Theme = {
    canvas: {
      background: "#fff",
    },
    node: {
      fill: "#000",
      activeFill: "#1de9ac",
      opacity: 1,
      selectedOpacity: 1,
      inactiveOpacity: 0.1,
      showRing:false,
      label: {
        color: "#FFF",
        activeColor: "#fafafa",
        fontSize: 4,
        ellipsis: 0,
        maxWidth: 100,
        backgroundColor: "#000",
        borderRadius: 2,
      },
    },
    edge: {
      fill: "#d8e6ea",
      activeFill: "#1DE9AC",
      opacity: 1,
      selectedOpacity: 1,
      inactiveOpacity: 1,
      label: {
        color: "#FFF",
        activeColor: "#fafafa",
        fontSize: 4,
        ellipsis: 0,
        maxWidth: 100,
        backgroundColor: "#00a2a1",
        borderRadius: 4,
      },
    },
    lasso: {
      background: "#fff",
      border: "none",
    },
    arrow: {
      fill: "#808080",
      activeFill: "#1de9ac",
    },
    ring: {
      fill: "#000",
      activeFill: "#000",
    },
  };
  return (
    <GraphCanvas
      theme={theme}
      ref={graphRef}
      draggable
      nodes={[
        {
          "id": "n-0",
          "label": "FRANCIS FAMILY OFFICE LIMITED FRANCIS FAMILY OFFICE LIMITED FRANCIS FAMILY OFFICE LIMITED FRANCIS FAMILY OFFICE LIMITED FRANCIS FAMILY OFFICE LIMITED FRANCIS FAMILY OFFICE LIMITED FRANCIS FAMILY OFFICE LIMITED FRANCIS FAMILY OFFICE LIMITED",
          "activeFill": "yellow",
          "data": {
            "priority": 6
          },
        },
        {
          "id": "n-1",
          "label": "FRANCIS FAMILY OFFICE LIMITED",
          "activeFill": "red",
          "data": {
            "priority": 0
          },
        },
        {
          "id": "n-2",
          "label": "Node 2",
          "activeFill": "orange",
          "data": {
            "priority": 3
          }
        },
        {
          "id": "n-3",
          "label": "Node 3",
          "activeFill": "green",
          "data": {
            "priority": 1
          }
        },
        {
          "id": "n-4",
          "label": "Node 4",
          "activeFill": "pink",
          "data": {
            "priority": 2
          }
        },
        {
          "id": "n-5",
          "label": "Node 5",
          "activeFill": "magenta",
          "data": {
            "priority": 2
          }
        }
      ]}
      edges={[{
        id: '0->1',
        source: 'n-0',
        target: 'n-1',
        label: 'Edge 0-1',
      },
      {
        id: '0->2',
        source: 'n-0',
        target: 'n-2',
        label: 'Edge 0-2',
      },
      {
        id: '0->3',
        source: 'n-0',
        target: 'n-3',
        label: 'Edge 0-3'
      },
      {
        id: '0->4',
        source: 'n-0',
        target: 'n-4',
        label: 'Edge 0-4'
      },
      {
        id: '1->5',
        source: 'n-4',
        target: 'n-5',
        label: 'Edge 0-5'
      },
      {
        id: '3->5',
        source: 'n-3',
        target: 'n-5',
        label: 'Edge 3-5'
      },
      {
        id: '2->3',
        source: 'n-2',
        target: 'n-3',
        label: 'Edge 2-3'
      }
      ]}
      selections={selections}
      actives={actives}
      onCanvasClick={onCanvasClick}
      onNodeClick={onNodeClick}
    />
  );
};
