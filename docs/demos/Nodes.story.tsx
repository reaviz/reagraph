import React, { useState } from 'react';
import { GraphCanvas, LayoutTypes } from '../../src';
import { iconNodes, manyNodes, simpleEdges, simpleNodes, simpleNodesColors } from '../assets/demo';

export default {
  title: 'Demos/Nodes',
  component: GraphCanvas
};

export const NoEdges = () => (
  <GraphCanvas nodes={manyNodes} edges={[]} />
);

export const Icons = () => (
  <GraphCanvas nodes={iconNodes} edges={simpleEdges} />
);

export const Colors = () => (
  <GraphCanvas nodes={simpleNodesColors} edges={simpleEdges} />
);

export const Draggable = () => {
  const [layout, setLayout] = useState<LayoutTypes>('forceDirected2d');
  const [nodes, setNodes] = useState(simpleNodes);

  return (
    <div>
      <button
        style={{
          position: 'absolute',
          top: 15,
          right: 15,
          zIndex: 999,
          width: 120
        }}
        onClick={() => setNodes([...nodes, { id: `n-${nodes.length}`, label: `Node ${nodes.length}` }])}
      >
        Update Nodes
      </button>
      <button
        style={{
          position: 'absolute',
          top: 40,
          right: 15,
          zIndex: 999,
          width: 120
        }}
        onClick={() => setLayout(layout === 'forceDirected2d' ? 'forceDirected3d' : 'forceDirected2d')}
      >
        Reset Layout
      </button>
      <GraphCanvas nodes={nodes} edges={simpleEdges} draggable layoutType={layout} />
    </div>
  );
};
