import React, { useState } from 'react';
import { GraphCanvas, lightTheme } from '../../src';
import { parentNodes, simpleEdges, simpleNodes } from '../assets/demo';
import random from 'lodash/random';
import { range } from 'd3-array';

export default {
  title: 'Demos/Basic',
  component: GraphCanvas
};

const SimpleStory = (args) => (
  <GraphCanvas {...args} />
);

export const Simple = SimpleStory.bind({});
Simple.args = {
  nodes: simpleNodes,
  edges: simpleEdges,
  cameraMode: 'pan',
  theme: lightTheme,
  layoutType: 'forceDirected2d',
  sizingType: 'none',
  labelType: 'auto'
};

export const TwoWayLink = () => (
  <GraphCanvas
    nodes={[{
      id: '1',
      label: '1'
    },
    {
      id: '2',
      label: '2'
    }]}
    edges={[{
      source: '1',
      target: '2',
      id: '1-2',
      label: '1-2'
    },
    {
      source: '2',
      target: '1',
      id: '2-1',
      label: '2-1'
    }]}
  />
);

export const Disabled = () => (
  <GraphCanvas nodes={simpleNodes} edges={simpleEdges} disabled />
);

export const Many = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
    {range(10).map(i => (
      <div key={i} style={{ border: 'solid 1px red', height: 350, width: 350, margin: 15, position: 'relative' }}>
        <GraphCanvas disabled nodes={simpleNodes} edges={simpleEdges} animated={false} />
      </div>
    ))}
  </div>
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

export const ExpandCollapse = () => (
  <GraphCanvas nodes={parentNodes} edges={simpleEdges} />
);