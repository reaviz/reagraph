import React from 'react';

import { GraphCanvas } from '../../src';
import { Badge, Sphere } from '../../src/symbols';
import { simpleEdges, simpleNodes } from '../assets/demo';
import userSvg from '../assets/user.svg';
import fireSvg from '../assets/fire.svg';

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

export const WithIcon = () => (
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
          label="6"
          backgroundColor="#6366f1"
          textColor="#ffffff"
          icon={userSvg}
          iconSize={0.35}
          padding={0.5}
          radius={0.15}
          iconPosition="start"
          position={[0, -10, 0]}
        />
      </group>
    )}
  />
);

export const WithIconEnd = () => (
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
          label="Team"
          backgroundColor="#10b981"
          textColor="#ffffff"
          icon={userSvg}
          iconSize={0.3}
          iconPosition="end"
          padding={0.5}
          strokeColor="#059669"
          strokeWidth={0.1}
          radius={0.15}
          position="top-left"
        />
      </group>
    )}
  />
);

export const WithCustomIconPosition = () => (
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
          label="Custom"
          backgroundColor="#f59e0b"
          textColor="#ffffff"
          icon={fireSvg}
          iconSize={0.6}
          iconPosition={[0.7, 0.3]}
          strokeWidth={0.2}
          radius={0.15}
          position="bottom-right"
        />
      </group>
    )}
  />
);
