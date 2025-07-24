import React from 'react';
import { GraphCanvas } from '../../src';
import { simpleEdges, simpleNodes } from '../assets/demo';
import { Badge, Sphere, Icon, Ring } from '../../src/symbols';

const createPersonIcon = (color = 'currentColor') =>
  `data:image/svg+xml;base64,${btoa(`
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="7" r="4" stroke="${color}" stroke-width="2" fill="none"/>
  <path d="M 4.5 20 A 7.5 7.5 0 0 1 19.5 20" stroke="${color}" stroke-width="2" fill="none"/>
</svg>
`)}`;

// Custom Gradient Ring Component
const GradientRing = ({ size, animated, opacity = 0.8 }) => (
  <group>
    <Ring
      size={size}
      color="#c02b2c"
      opacity={opacity}
      animated={animated}
      innerRadius={2}
      strokeWidth={2}
    />
    <Ring
      size={size}
      color="#f15c5f"
      opacity={opacity * 0.5}
      animated={animated}
      innerRadius={1.9}
      strokeWidth={2}
    />
    <Ring
      size={size}
      color="#d63d42"
      opacity={opacity * 0.2}
      animated={animated}
      innerRadius={1.8}
      strokeWidth={2}
    />
  </group>
);

export default {
  title: 'Demos/Edges',
  component: GraphCanvas
};

export const Sizes = () => (
  <GraphCanvas
    labelType="all"
    nodes={[
      {
        id: '1',
        label: '1'
      },
      {
        id: '2',
        label: '2'
      },
      {
        id: '3',
        label: '3'
      },
      {
        id: '4',
        label: '4'
      },
      {
        id: '5',
        label: '5'
      }
    ]}
    edges={[
      {
        source: '1',
        target: '2',
        id: '1-2',
        label: '1-2'
      },
      {
        source: '2',
        target: '3',
        id: '2-3',
        label: '2-3',
        size: 5
      },
      {
        source: '3',
        target: '4',
        id: '3-4',
        label: '3-4',
        size: 3
      },
      {
        source: '4',
        target: '5',
        id: '4-5',
        label: '4-5',
        size: 10
      }
    ]}
  />
);

export const Events = () => (
  <GraphCanvas
    nodes={simpleNodes}
    edges={simpleEdges}
    onEdgeClick={edge => alert(`Edge ${edge.id} clicked`)}
  />
);

export const Dashed = () => (
  <GraphCanvas
    edgeInterpolation="curved"
    labelType="all"
    nodes={[
      {
        id: '1',
        label: '1'
      },
      {
        id: '2',
        label: '2'
      },
      {
        id: '3',
        label: '3'
      },
      {
        id: '4',
        label: '4'
      },
      {
        id: '5',
        label: '5'
      }
    ]}
    edges={[
      {
        source: '1',
        target: '2',
        id: '1-2',
        label: '1-2',
        dashed: true
      },
      {
        source: '2',
        target: '3',
        id: '2-3',
        label: '2-3',
        size: 5,
        dashed: true
      },
      {
        source: '3',
        target: '4',
        id: '3-4',
        label: '3-4',
        size: 3,
        dashed: true
      },
      {
        source: '4',
        target: '5',
        id: '4-5',
        label: '4-5',
        size: 10,
        dashed: true
      }
    ]}
  />
);
