import React, { useRef } from 'react';
import { GraphCanvas, GraphCanvasRef, useSelection } from '../../src';

export default {
  title: 'Demos/IntersectingEdges',
  component: GraphCanvas
};

// Create nodes in a grid pattern to ensure edge intersections
const intersectingNodes = [
  { id: '0', label: 'Node 0', x: -200, y: -200 },
  { id: '1', label: 'Node 1', x: 0, y: -200 },
  { id: '2', label: 'Node 2', x: 200, y: -200 },
  { id: '3', label: 'Node 3', x: -200, y: 0 },
  { id: '4', label: 'Node 4', x: 0, y: 0 },
  { id: '5', label: 'Node 5', x: 200, y: 0 },
  { id: '6', label: 'Node 6', x: -200, y: 200 },
  { id: '7', label: 'Node 7', x: 0, y: 200 },
  { id: '8', label: 'Node 8', x: 200, y: 200 }
];

// Create edges that will intersect
const intersectingEdges = [
  // Horizontal edges
  {
    id: '0->1',
    source: '0',
    target: '1',
    label: 'Edge 0-1',
    subLabel: 'Horizontal'
  },
  {
    id: '1->2',
    source: '1',
    target: '2',
    label: 'Edge 1-2',
    subLabel: 'Horizontal'
  },
  {
    id: '3->4',
    source: '3',
    target: '4',
    label: 'Edge 3-4',
    subLabel: 'Horizontal'
  },
  {
    id: '4->5',
    source: '4',
    target: '5',
    label: 'Edge 4-5',
    subLabel: 'Horizontal'
  },
  {
    id: '6->7',
    source: '6',
    target: '7',
    label: 'Edge 6-7',
    subLabel: 'Horizontal'
  },
  {
    id: '7->8',
    source: '7',
    target: '8',
    label: 'Edge 7-8',
    subLabel: 'Horizontal'
  },

  // Vertical edges
  {
    id: '0->3',
    source: '0',
    target: '3',
    label: 'Edge 0-3',
    subLabel: 'Vertical'
  },
  {
    id: '3->6',
    source: '3',
    target: '6',
    label: 'Edge 3-6',
    subLabel: 'Vertical'
  },
  {
    id: '1->4',
    source: '1',
    target: '4',
    label: 'Edge 1-4',
    subLabel: 'Vertical'
  },
  {
    id: '4->7',
    source: '4',
    target: '7',
    label: 'Edge 4-7',
    subLabel: 'Vertical'
  },
  {
    id: '2->5',
    source: '2',
    target: '5',
    label: 'Edge 2-5',
    subLabel: 'Vertical'
  },
  {
    id: '5->8',
    source: '5',
    target: '8',
    label: 'Edge 5-8',
    subLabel: 'Vertical'
  },

  // Diagonal edges that will intersect with horizontal/vertical ones
  {
    id: '0->4',
    source: '0',
    target: '4',
    label: 'Edge 0-4',
    subLabel: 'Diagonal'
  },
  {
    id: '4->8',
    source: '4',
    target: '8',
    label: 'Edge 4-8',
    subLabel: 'Diagonal'
  },
  {
    id: '2->4',
    source: '2',
    target: '4',
    label: 'Edge 2-4',
    subLabel: 'Diagonal'
  },
  {
    id: '4->6',
    source: '4',
    target: '6',
    label: 'Edge 4-6',
    subLabel: 'Diagonal'
  },

  // Additional crossing edges
  {
    id: '1->5',
    source: '1',
    target: '5',
    label: 'Edge 1-5',
    subLabel: 'Crossing'
  },
  {
    id: '3->5',
    source: '3',
    target: '5',
    label: 'Edge 3-5',
    subLabel: 'Crossing'
  },
  {
    id: '1->3',
    source: '1',
    target: '3',
    label: 'Edge 1-3',
    subLabel: 'Crossing'
  },
  {
    id: '5->7',
    source: '5',
    target: '7',
    label: 'Edge 5-7',
    subLabel: 'Crossing'
  }
];

export const IntersectingEdges = () => {
  const graphRef = useRef<GraphCanvasRef | null>(null);

  const {
    selections,
    actives,
    onCanvasClick,
    onNodePointerOver: onNodePointerOverSelection,
    onNodePointerOut: onNodePointerOutSelection
  } = useSelection({
    ref: graphRef,
    nodes: intersectingNodes,
    edges: intersectingEdges,
    pathHoverType: 'all'
  });

  return (
    <GraphCanvas
      ref={graphRef}
      nodes={intersectingNodes}
      edges={intersectingEdges}
      labelType={'all'}
      draggable={true}
      selections={selections}
      actives={actives}
      onCanvasClick={onCanvasClick}
      onNodePointerOver={onNodePointerOverSelection}
      onNodePointerOut={onNodePointerOutSelection}
    />
  );
};
