import React from 'react';
import { darkTheme, GraphCanvas, RadialMenu } from '../../src';
import { simpleEdges, simpleNodes } from '../assets/demo';

export default {
  title: 'Demos/Context Menu/Radial',
  component: GraphCanvas
};

export const Simple = () => (
  <GraphCanvas
    nodes={simpleNodes}
    edges={simpleEdges}
    contextMenu={({ data, onClose }) => (
      <RadialMenu
        onClose={onClose}
        theme={darkTheme}
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
          }
        ]}
      />
    )}
  />
);

export const Disabled = () => (
  <GraphCanvas
    nodes={simpleNodes}
    edges={simpleEdges}
    contextMenu={({ data, onClose }) => (
      <RadialMenu
        onClose={onClose}
        theme={darkTheme}
        items={[
          {
            label: 'Add Node',
            disabled: () => true,
            onClick: () => {
              alert('Add a node');
              onClose();
            }
          },
          {
            label: 'Remove Node',
            disabled: () => true,
            onClick: () => {
              alert('Remove the node');
              onClose();
            }
          }
        ]}
      />
    )}
  />
);

export const Empty = () => (
  <GraphCanvas
    nodes={simpleNodes}
    edges={simpleEdges}
    contextMenu={({ data, onClose }) => (
      <RadialMenu
        theme={darkTheme}
        onClose={onClose}
        items={[
          {
            label: 'Add Node',
            visible: () => false,
            onClick: () => {
              alert('Add a node');
              onClose();
            }
          },
          {
            label: 'Remove Node',
            visible: () => false,
            onClick: () => {
              alert('Remove the node');
              onClose();
            }
          }
        ]}
      />
    )}
  />
);
