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
    contextMenu={({ data, canCollapse, isCollapsed, onCollapse, onClose }) => (
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

export const RadialContextMenu = () => (
  <GraphCanvas
    nodes={parentNodes}
    edges={parentEdges}
    contextMenu={({ data, canCollapse, isCollapsed, onCollapse, onClose }) => (
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
            label: 'Remove',
            onClick: () => {
              alert('Remove the node');
              onClose();
            }
          },
          ...(canCollapse
            ? [{
              label: isCollapsed ? 'Expand' : 'Collapse',
              onClick: onCollapse
            }]
            : [])
        ]}
      />
    )}
  />
);
