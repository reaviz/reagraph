import React from 'react';
import { GraphCanvas, RadialMenu } from '../../src';
import { parentEdges, parentNodes } from '../assets/demo';

export default {
  title: 'Demos/Collapsible',
  component: GraphCanvas
};

export const ContextMenu = () => (
  <GraphCanvas
    nodes={parentNodes}
    edges={parentEdges}
    contextMenu={({ data, additional, onClose }) => (
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
        {additional.canCollapse && (
          <button onClick={additional.onCollapse}>{additional.isCollapsed ? 'Expand Node' : 'Collapse Node'}</button>
        )}
        <button onClick={onClose}>Close Menu</button>
      </div>
    )}
  />
);

export const RadialContextMenu = () => (
  <GraphCanvas
    nodes={parentNodes}
    edges={parentEdges}
    contextMenu={({ data, additional, onClose }) => (
      <RadialMenu
        onClose={onClose}
        items={[
          {
            label: 'Add Node',
            onClick: () => {
              alert('Add a node');
              onClose();
            }
          },
          {
            label: 'Remove Node',
            onClick: () => {
              alert('Remove the node');
              onClose();
            }
          },
          ...(additional.canCollapse
            ? [{
              label: additional.isCollapsed ? 'Expand Node' : 'Collapse Node',
              onClick: additional.onCollapse
            }]
            : [])
        ]}
      />
    )}
  />
);