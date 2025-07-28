import React from 'react';
import { GraphCanvas } from '../../src';
import { Badge, Sphere, Icon, Ring } from '../../src/symbols';
import { RoundedBox } from '@react-three/drei';

const userSvg = (color = 'black') =>
  `data:image/svg+xml;base64,${btoa(`
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z"
    stroke="${color}"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
`)}`;

const loginSvg = (color = 'black') =>
  `data:image/svg+xml;base64,${btoa(`
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M15 3H16.2C17.8802 3 18.7202 3 19.362 3.32698C19.9265 3.6146 20.3854 4.07354 20.673 4.63803C21 5.27976 21 6.11985 21 7.8V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H15M10 7L15 12M15 12L10 17M15 12L3 12"
    stroke="${color}"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
`)}`;

const getSeverityColor = (severity: string) => {
  switch (severity) {
  case 'critical':
    return '#e53e3e'; // Red
  case 'high':
    return '#fd8c73'; // Orange
  case 'medium':
    return '#fbb360'; // Light Orange
  case 'low':
    return '#68d391'; // Green
  case 'info':
    return '#4299e1'; // Blue
  default:
    return '#9ca3af'; // Gray
  }
};

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
        <Ring
          size={rest.size}
          color="#f15c5f"
          opacity={1}
          animated={rest.animated}
          innerRadius={2}
          strokeWidth={3}
        />
        <Icon
          {...rest}
          node={node}
          image={userSvg('#c02b2c')}
          size={rest.size}
        />
        {/* First badge - top-right */}
        {node.data.badge && (
          <Badge
            {...rest}
            node={node}
            badgeSize={1.1}
            position={[7, 7, 11]}
            label={node.data.badge.toLocaleString()}
            backgroundColor="#ffffff"
            textColor="#000000"
            radius={0.15}
            strokeWidth={0.05}
            strokeColor="#ededef"
          />
        )}
        {node.id === '2' && (
          <group position={[0, -10, 20]}>
            {/* Circular background for icon */}
            <mesh>
              <RoundedBox
                args={[7, 7, 0]}
                radius={3}
                smoothness={8}
                material-color="#f35555"
                material-transparent={true}
                material-opacity={1}
              />
            </mesh>
            <Icon
              id={node.id}
              image={loginSvg('#ffffff')}
              size={5}
              opacity={rest.opacity}
              animated={rest.animated}
              color={rest.color}
              node={node}
              active={rest.active}
              selected={rest.selected}
            />
          </group>
        )}
      </group>
    )}
  />
);
