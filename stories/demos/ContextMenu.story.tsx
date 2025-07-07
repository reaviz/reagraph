import React from 'react';
import { GraphCanvas } from '../../src';
import { parentEdges, parentNodes, simpleEdges, simpleNodes } from '../assets/demo';

export default {
  title: 'Demos/Context Menu',
  component: GraphCanvas
};

export const Node = () => (
  <GraphCanvas
    nodes={simpleNodes}
    edges={simpleEdges}
    contextMenu={({ data, onClose }) => (
      <div
        style={{
          background: 'white',
          width: 150,
          border: 'solid 1px blue',
          borderRadius: 2,
          padding: 5,
          textAlign: 'center'
        }}
      >
        <h1>{data.label}</h1>
        <button onClick={onClose}>Close Menu</button>
      </div>
    )}
  />
);

export const Collapsible = () => (
  <GraphCanvas
    nodes={parentNodes}
    edges={parentEdges}
    contextMenu={({ data, onCollapse, isCollapsed, canCollapse, onClose }) => (
      <div
        style={{
          background: 'white',
          width: 150,
          border: 'solid 1px blue',
          borderRadius: 2,
          padding: 5,
          textAlign: 'center'
        }}
      >
        <h1>{data.label}</h1>
        {canCollapse && (
          <button onClick={onCollapse}>{isCollapsed ? 'Expand Node' : 'Collapse Node'}</button>
        )}
        <button onClick={onClose}>Close Menu</button>
      </div>
    )}
  />
);

export const Edge = () => (
  <GraphCanvas
    nodes={simpleNodes}
    edges={simpleEdges}
    contextMenu={({ data, onClose }) => (
      <div
        style={{
          background: 'white',
          width: 150,
          border: 'solid 1px blue',
          borderRadius: 2,
          padding: 5,
          textAlign: 'center'
        }}
      >
        <h1>{data.label}</h1>
        <button onClick={onClose}>Close Menu</button>
      </div>
    )}
  />
);
