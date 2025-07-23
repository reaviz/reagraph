import React from 'react';
import { GraphCanvas } from '../../src';
import { Badge, Sphere } from '../../src/symbols';
import { simpleNodes, simpleEdges } from '../assets/demo';

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
        <Sphere
          {...rest}
          node={node}
        />
        <Badge
          {...rest}
          node={node}
          label="3"
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
        <Sphere
          {...rest}
          node={node}
        />
        <Badge
          {...rest}
          node={node}
          label="5"
          backgroundColor="#ff6b6b"
          textColor="#ffffff"
          badgeSize={0.3}
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
        <Sphere
          {...rest}
          node={node}
        />
        <Badge
          {...rest}
          node={node}
          label="99+"
          backgroundColor="#4ecdc4"
          textColor="#ffffff"
          badgeSize={0.35}
          position={[rest.size * 0.7, rest.size * 0.7, 0.1]}
        />
      </group>
    )}
  />
);
