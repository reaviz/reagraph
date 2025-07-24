import React from 'react';
import { GraphCanvas } from '../../src';
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

export const Special = () => (
  <GraphCanvas
    edgeArrowPosition="none"
    edgeInterpolation="curved"
    nodes={[
      {
        id: '1',
        data: {
          badge: ''
        }
      },
      {
        id: '2',
        data: {
          badge: 6
        }
      }
    ]}
    edges={[
      {
        source: '1',
        target: '2',
        id: '1-2',
        dashed: true,
        fill: '#ee8a8f'
      }
    ]}
    renderNode={({ node, ...rest }) => (
      <group>
        <Sphere {...rest} node={node} color="#eabac6" />
        <GradientRing size={rest.size} animated={rest.animated} />
        <Icon
          {...rest}
          node={node}
          image={createPersonIcon('#c02b2c')}
          size={rest.size}
        />
        {node.data.badge && (
          <Badge
            {...rest}
            node={node}
            label={node.data.badge.toLocaleString()}
            backgroundColor="#ffffff"
            textColor="#000000"
          />
        )}
      </group>
    )}
  />
);
