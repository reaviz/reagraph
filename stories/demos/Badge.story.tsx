import React from 'react';

import { GraphCanvas } from '../../src';
import { Badge, Sphere } from '../../src/symbols';
import { simpleEdges, simpleNodes } from '../assets/demo';

export default {
  title: 'Demos/Badge',
  component: Badge
};

export const Default = () => (
  <GraphCanvas
    nodes={simpleNodes}
    edges={simpleEdges}
    cameraMode="rotate"
    renderNode={({ node, ...rest }) => (
      <group>
        <Sphere {...rest} node={node} />
        <Badge
          {...rest}
          node={node}
          label={node.data.count.toLocaleString()}
          backgroundColor="#000000"
          textColor="#ffffff"
        />
      </group>
    )}
  />
);

export const CustomColors = () => (
  <GraphCanvas
    nodes={simpleNodes}
    edges={simpleEdges}
    cameraMode="rotate"
    renderNode={({ node, ...rest }) => (
      <group>
        <Sphere {...rest} node={node} />
        <Badge
          {...rest}
          node={node}
          label="5"
          backgroundColor="#ff6b6b"
          textColor="#ffffff"
          position="center"
        />
      </group>
    )}
  />
);

export const DifferentSizes = () => (
  <GraphCanvas
    nodes={simpleNodes}
    edges={simpleEdges}
    cameraMode="rotate"
    renderNode={({ node, ...rest }) => (
      <group>
        <Sphere {...rest} node={node} />
        <Badge
          {...rest}
          node={node}
          label="99+"
          backgroundColor="#4ecdc4"
          textColor="#ffffff"
          padding={0.8}
          badgeSize={1}
          strokeColor="#b19cd9"
          strokeWidth={0.3}
          radius={0.15}
          position="bottom-left"
        />
      </group>
    )}
  />
);
