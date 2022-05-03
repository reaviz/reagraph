import React, { useState } from 'react';
import { GraphCanvas } from '../../src';
import { simpleEdges, simpleNodes } from '../assets/demo';
import random from 'lodash/random';

export default {
  title: 'Demos/Basic',
  component: GraphCanvas
};

export const Simple = () => (
  <GraphCanvas nodes={simpleNodes} edges={simpleEdges} />
);

export const LiveUpdates = () => {
  const [nodes, setNodes] = useState(simpleNodes);
  const [edges, setEdges] = useState(simpleEdges);
  return (
    <div>
      <div style={{ zIndex: 9, position: 'absolute', top: 15, right: 15, background: 'rgba(0, 0, 0, .5)', padding: 1, color: 'white' }}>
        <button
          style={{ display: 'block', width: '100%' }}
          onClick={() => {
            const num = random(0, 1000);
            setNodes([...nodes, { id: `n-${num}`, label: `Node ${num}` }]);
            if (random(0, 2) !== 2) {
              setEdges([...edges, { id: `e-${num}`, source: nodes[nodes.length - 1].id, target: `n-${num}` }]);
            }
          }}
        >
          Add Node
        </button>
        <button
          style={{ display: 'block', width: '100%' }}
          onClick={() => {
            setNodes(nodes.filter(n => n.id !== nodes[0]?.id))
          }}
        >
          Remove Node {nodes[0]?.id}
        </button>
      </div>
      <GraphCanvas nodes={nodes} edges={edges} />
    </div>
  );
};

export const NoAnimation = () => (
  <GraphCanvas animated={false} nodes={simpleNodes} edges={simpleEdges} />
);
