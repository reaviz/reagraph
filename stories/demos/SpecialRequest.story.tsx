import React from 'react';
import { GraphCanvas } from '../../src';
import { Badge, Sphere, Icon, Ring } from '../../src/symbols';
import { RoundedBox } from '@react-three/drei';
import { range } from 'lodash';
import {
  RingGeometry,
  BufferGeometry,
  Line,
  Vector3,
  lineDashedMaterial
} from 'three';
import { useRef, useEffect } from 'react';

const RADIUS = 10;
const SPACING = 30;

// Dashed Circle Component
function DashedCircle({ radius }: { radius: number }) {
  const lineRef = useRef<Line>(null!);

  const segments = 128;
  const points = [];

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(
      new Vector3(radius * Math.cos(angle), radius * Math.sin(angle), 0)
    );
  }

  useEffect(() => {
    if (lineRef.current) {
      lineRef.current.computeLineDistances();
    }
  }, []);

  const geometry = new BufferGeometry().setFromPoints(points);

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineDashedMaterial
        attach="material"
        color="#888"
        dashSize={10}
        gapSize={6}
      />
    </line>
  );
}

function ConcentricRings({ maxLevel }: { maxLevel: number }) {
  const colors = [
    '#e8e6f7',
    '#f0eefb',
    '#f9f5fe',
    '#D1C4E9',
    '#C5CAE9',
    '#BBDEFB',
    '#B3E5FC',
    '#B2EBF2',
    '#B2DFDB',
    '#C8E6C9',
    '#DCEDC8',
    '#F0F4C3'
  ];

  return (
    <>
      {range(maxLevel).map(level => {
        const inner = RADIUS + level * SPACING + 50;
        const outer = RADIUS + (level + 1) * SPACING + 50;
        const color = colors[level % colors.length];
        return (
          <FilledRing
            key={`fill-${level}`}
            innerRadius={inner}
            outerRadius={outer}
            color={color}
          />
        );
      })}

      {range(maxLevel).map(level => (
        <DashedCircle
          key={`circle-${level}`}
          radius={RADIUS + level * SPACING + 50}
        />
      ))}
    </>
  );
}

// Filled Ring Component
function FilledRing({
  innerRadius,
  outerRadius,
  color,
  position = [0, 0, 0]
}: {
  innerRadius: number;
  outerRadius: number;
  color: string;
  position?: [number, number, number];
}) {
  const geometry = new RingGeometry(innerRadius, outerRadius, 64);

  return (
    <mesh geometry={geometry} position={position}>
      <meshBasicMaterial
        attach="material"
        color={color}
        transparent={true}
        opacity={0.2}
        side={2}
      />
    </mesh>
  );
}

const userSvg = (color = 'black') =>
  `data:image/svg+xml;base64,${btoa(`
<svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
<svg width="50" height="50" viewBox="-2 -3 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M15 3H16.2C17.8802 3 18.7202 3 19.362 3.32698C19.9265 3.6146 20.3854 4.07354 20.673 4.63803C21 5.27976 21 6.11985 21 7.8V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H15M10 7L15 12M15 12L10 17M15 12L3 12"
    stroke="${color}"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
`)}`;

const coreSvg = (color = 'black') =>
  `data:image/svg+xml;base64,${btoa(`
<svg width="50" height="50" viewBox="0 0 16 23" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.85774 16.6502H12.7093C12.8012 16.5264 12.8849 16.4 12.9605 16.2681C13.1761 15.8931 13.3299 15.4821 13.4254 15.0249L13.4673 14.828H8.85678L8.85774 16.6502ZM13.5628 17.7163C13.5473 17.7362 13.531 17.756 13.5128 17.7741C13.3608 17.9485 13.1952 18.1165 13.016 18.2782C12.47 18.7724 11.804 19.3687 11.2007 19.8936C10.7621 20.2748 10.3818 20.5947 10.1543 20.7618C9.71391 21.0861 9.24894 21.2451 8.85677 21.322V22.1061C8.85677 22.4729 8.5574 22.7702 8.18799 22.7702C7.81858 22.7702 7.51921 22.4729 7.51921 22.1061V21.3752C7.07518 21.3382 6.43461 21.2 5.84044 20.7627C5.61296 20.5956 5.23352 20.2766 4.79404 19.8945C4.19078 19.3705 3.52473 18.7733 2.97877 18.2791C2.52473 17.8681 2.15804 17.4218 1.87414 16.9276C1.59024 16.4343 1.38917 15.894 1.26178 15.2959L0.157148 10.0668C0.0479594 9.55097 -0.00390625 9.05408 -0.00390625 8.57796C-0.00390625 6.79366 0.697627 5.23708 1.83046 4.03626C2.94511 2.85454 4.47732 2.02518 6.16354 1.6737C6.60756 1.58155 7.06072 1.52102 7.51748 1.49572V0.767552C7.51748 0.400761 7.81685 0.103516 8.18626 0.103516C8.55568 0.103516 8.85504 0.400761 8.85504 0.767552V1.52463C9.1826 1.55625 9.50745 1.60594 9.82774 1.6728C11.5138 2.02423 13.046 2.85361 14.1608 4.03535C14.2218 4.0995 14.2809 4.16545 14.3401 4.2314C14.3746 4.26393 14.4047 4.29916 14.432 4.33891C15.2427 5.3011 15.7877 6.46473 15.947 7.773L15.9497 7.79649C15.9797 8.05127 15.9961 8.31237 15.9961 8.57707C15.9961 9.05409 15.9442 9.55098 15.835 10.066L15.6167 11.1022C15.6121 11.1356 15.6057 11.1673 15.5966 11.1989L14.9515 14.2534C14.947 14.286 14.9406 14.3176 14.9315 14.3483L14.7313 15.2951C14.6049 15.8941 14.4038 16.4335 14.119 16.9268C13.9588 17.2041 13.7741 17.467 13.5612 17.7164L13.5628 17.7163ZM11.3618 17.9783H8.85769V19.9613C9.01874 19.9062 9.19163 19.8222 9.36088 19.6975C9.55833 19.5521 9.91047 19.2567 10.3236 18.8971C10.6347 18.6261 10.9969 18.3044 11.3618 17.9783ZM8.85769 13.4999H13.7484L14.1333 11.6777H8.85776L8.85769 13.4999ZM8.85769 10.3496H14.4137L14.5301 9.79583C14.6184 9.38114 14.6594 8.97459 14.6594 8.57708V8.5274H8.85692L8.85769 10.3496ZM8.85769 7.19933H14.4782C14.2953 6.52898 13.9814 5.91733 13.5674 5.37708H8.85764L8.85769 7.19933ZM8.85769 4.04903H12.1426C11.3846 3.53585 10.502 3.16546 9.55836 2.96849C9.32906 2.92061 9.09521 2.88357 8.85774 2.85647L8.85769 4.04903Z" fill="#1F1F21"/>
</svg>
`)}`;

export default {
  title: 'Demos/Edges',
  component: GraphCanvas
};

export const Special = () => (
  <GraphCanvas
    edgeArrowPosition="none"
    edgeInterpolation="curved"
    layoutType="forceDirected2d"
    nodes={[
      {
        id: '1',
        // Pin node to specific position using fx, fy, fz
        fx: 40,
        fy: 0,
        fz: 0
      },
      {
        id: '2',
        data: {
          badge: 6
        },
        fx: 0,
        fy: 40,
        fz: 0
      },
      {
        id: 'core',
        fill: '#bfbecc',
        data: {
          borderColor: '#000000',
          image: coreSvg('#000000')
        },
        // Pin node to center
        fx: 0,
        fy: 0,
        fz: 0
      }
    ]}
    edges={[
      {
        source: '1',
        target: '2',
        id: '1-2',
        dashed: true,
        fill: '#ee8a8f'
      },
      {
        source: 'core',
        target: '1',
        id: 'core-1',
        dashed: true,
        fill: '#bcbac8',
        interpolation: 'linear',
        arrowPlacement: 'end'
      },
      {
        source: 'core',
        target: '2',
        id: 'core-2',
        dashed: true,
        fill: '#bcbac8',
        interpolation: 'linear',
        arrowPlacement: 'end'
      }
    ]}
    renderNode={({ node, ...rest }) => (
      <group>
        <Sphere {...rest} node={node} color={node.fill || '#eabac6'} />
        <Ring
          size={rest.size}
          color={node.data.borderColor || '#f15c5f'}
          opacity={1}
          animated={rest.animated}
          innerRadius={2}
          strokeWidth={3}
        />
        <Icon
          {...rest}
          node={node}
          image={node.data.image || userSvg('#c02b2c')}
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
  >
    {/* Circular background in center of canvas */}
    <ConcentricRings maxLevel={2} />
  </GraphCanvas>
);
