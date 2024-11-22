import React, { useCallback, useState } from 'react';
import { Billboard, Html, Svg, Text } from 'glodrei';
import { Color, DoubleSide } from 'three';
import { a } from '@react-spring/three';
import { GraphCanvas, Icon, Label, lightTheme, Sphere } from '../../src';
import {
  clusterNodes,
  clusterEdges,
  random,
  singleNodeClusterNodes,
  imbalancedClusterNodes,
  manyClusterNodes
} from '../assets/demo';

import demonSvg from '../../docs/assets/twitter.svg';
import { Ring } from '../../src/symbols/clusters/Ring';

export default {
  title: 'Demos/Cluster',
  component: GraphCanvas
};

export const Simple = () => {
  const [nodes, setNodes] = useState([
    {
      id: 'n-0',
      label: 'MD5 0',
      fill: '#075985',
      data: {
        type: 'MD5',
        segment: 'A'
      }
    },
    {
      id: 'n-1',
      label: 'Email 1',
      fill: '#166534',
      data: {
        type: 'Email'
      }
    },
    {
      id: 'n-2',
      label: 'MD5 2',
      fill: '#075985',
      data: {
        type: 'MD5',
        segment: 'A'
      }
    },
    {
      id: 'n-3',
      label: 'URL 3',
      fill: '#c2410c',
      data: {
        type: 'URL'
      }
    },
    {
      id: 'n-4',
      label: 'MD5 4',
      fill: '#075985',
      data: {
        type: 'MD5',
        segment: 'A'
      }
    },
    {
      id: 'n-5',
      label: 'MD5 5',
      fill: '#075985',
      data: {
        type: 'MD5'
      }
    },
    {
      id: 'n-6',
      label: 'IP 6',
      fill: '#3730a3',
      data: {
        type: 'IP',
        segment: 'A'
      }
    },
    {
      id: 'n-7',
      label: 'IP 7',
      fill: '#3730a3',
      data: {
        type: 'IP'
      }
    },
    {
      id: 'n-8',
      label: 'URL 8',
      fill: '#c2410c',
      data: {
        type: 'URL',
        segment: 'A'
      }
    },
    {
      id: 'n-9',
      label: 'MD5 9',
      fill: '#075985',
      data: {
        type: 'MD5'
      }
    },
    {
      id: 'n-10',
      label: 'URL 10',
      fill: '#c2410c',
      data: {
        type: 'URL',
        segment: 'A'
      }
    },
    {
      id: 'n-11',
      label: 'URL 11',
      fill: '#c2410c',
      data: {
        type: 'URL'
      }
    },
    {
      id: 'n-12',
      label: 'URL 12',
      fill: '#c2410c',
      data: {
        type: 'URL',
        segment: 'A'
      }
    },
    {
      id: 'n-13',
      label: 'Email 13',
      fill: '#166534',
      data: {
        type: 'Email'
      }
    },
    {
      id: 'n-14',
      label: 'URL 14',
      fill: '#c2410c',
      data: {
        type: 'URL',
        segment: 'A'
      }
    },
    {
      id: 'n-15',
      label: 'IP 15',
      fill: '#3730a3',
      data: {
        type: 'IP'
      }
    },
    {
      id: 'n-16',
      label: 'Email 16',
      fill: '#166534',
      data: {
        type: 'Email',
        segment: 'A'
      }
    },
    {
      id: 'n-17',
      label: 'Email 17',
      fill: '#166534',
      data: {
        type: 'Email'
      }
    },
    {
      id: 'n-18',
      label: 'URL 18',
      fill: '#c2410c',
      data: {
        type: 'URL',
        segment: 'A'
      }
    },
    {
      id: 'n-19',
      label: 'Email 19',
      fill: '#166534',
      data: {
        type: 'Email'
      }
    },
    {
      id: 'n-20',
      label: 'Email 20',
      fill: '#166534',
      data: {
        type: 'Email',
        segment: 'A'
      }
    },
    {
      id: 'n-21',
      label: 'Email 21',
      fill: '#166534',
      data: {
        type: 'Email'
      }
    },
    {
      id: 'n-22',
      label: 'Email 22',
      fill: '#166534',
      data: {
        type: 'Email',
        segment: 'A'
      }
    },
    {
      id: 'n-23',
      label: 'URL 23',
      fill: '#c2410c',
      data: {
        type: 'URL'
      }
    },
    {
      id: 'n-24',
      label: 'Email 24',
      fill: '#166534',
      data: {
        type: 'Email',
        segment: 'A'
      }
    }
  ] as any);

  const addNode = useCallback(() => {
    const next = nodes.length + 2;
    setNodes(prev => [
      ...prev,
      {
        id: `${next}`,
        label: `Node ${next}`,
        fill: '#3730a3',
        data: {
          type: 'IP',
          segment: next % 2 === 0 ? 'A' : undefined
        }
      }
    ]);
  }, [nodes]);

  return (
    <>
      <GraphCanvas
        nodes={nodes}
        draggable
        edges={[
          {
            source: 'n-6',
            target: 'n-1',
            id: 'n-6-n-1',
            label: 'n-6-n-1'
          }
        ]}
        clusterAttribute="type"
        constrainDragging={false}
      />
      <div style={{ zIndex: 9, position: 'absolute', top: 15, right: 15 }}>
        <button type="button" onClick={addNode}>
          Add node
        </button>
      </div>
    </>
  );
};

export const SimpleRenderNode = () => {
  const [nodes, setNodes] = useState(
    clusterNodes.map(n => ({ ...n, icon: demonSvg }))
  );

  const addNode = useCallback(() => {
    const next = nodes.length + 2;
    setNodes(prev => [
      ...prev,
      {
        id: `${next}`,
        label: `Node ${next}`,
        fill: '#3730a3',
        icon: demonSvg,
        data: {
          type: 'IP',
          segment: next % 2 === 0 ? 'A' : undefined
        }
      }
    ]);
  }, [nodes]);

  return (
    <>
      <GraphCanvas
        nodes={nodes}
        draggable
        edges={[]}
        clusterAttribute="type"
        constrainDragging={false}
        renderNode={node => (
          <group>
            <Sphere
              id={node.id}
              size={node.size}
              opacity={0.5}
              animated={false}
              color="purple"
              node={node.node}
              active={false}
              selected={node.selected}
            ></Sphere>
            <Icon
              id={node.id}
              image={demonSvg}
              size={node.size}
              opacity={1}
              animated={false}
              color="red"
              node={node.node}
              active={false}
              selected={node.selected}
            />
          </group>
        )}
      />
      <div style={{ zIndex: 9, position: 'absolute', top: 15, right: 15 }}>
        <button type="button" onClick={addNode}>
          Add node
        </button>
      </div>
    </>
  );
};

const clusterNodesWithSizes = clusterNodes.map(node => ({
  ...node,
  size: random(0, 50)
}));

export const Sizes = () => (
  <GraphCanvas
    nodes={clusterNodesWithSizes}
    draggable
    edges={[]}
    clusterAttribute="type"
  />
);

export const SingleNodeClusters = () => (
  <GraphCanvas
    nodes={singleNodeClusterNodes}
    draggable
    edges={[]}
    clusterAttribute="type"
  />
);

export const ImbalancedClusters = () => (
  <GraphCanvas
    nodes={imbalancedClusterNodes}
    draggable
    edges={[]}
    clusterAttribute="type"
  />
);

export const LargeDataset = () => (
  <GraphCanvas
    nodes={manyClusterNodes}
    draggable
    edges={[]}
    clusterAttribute="type"
  />
);

export const Edges = () => (
  <GraphCanvas
    nodes={clusterNodes}
    draggable
    edges={clusterEdges}
    clusterAttribute="type"
  />
);

export const Selections = () => (
  <GraphCanvas
    nodes={clusterNodes}
    selections={[clusterNodes[0].id]}
    edges={clusterEdges}
    clusterAttribute="type"
  />
);

export const Events = () => (
  <GraphCanvas
    nodes={clusterNodes}
    draggable
    edges={clusterEdges}
    clusterAttribute="type"
    onClusterPointerOut={cluster => console.log('cluster pointer out', cluster)}
    onClusterPointerOver={cluster =>
      console.log('cluster pointer over', cluster)
    }
    onClusterClick={cluster => console.log('cluster click', cluster)}
  />
);

export const NoBoundary = () => (
  <GraphCanvas
    theme={{
      ...lightTheme,
      cluster: null
    }}
    nodes={clusterNodes}
    draggable
    edges={clusterEdges}
    clusterAttribute="type"
  />
);

export const NoLabels = () => (
  <GraphCanvas
    theme={{
      ...lightTheme,
      cluster: {
        ...lightTheme.cluster,
        label: null
      }
    }}
    nodes={clusterNodes}
    draggable
    edges={clusterEdges}
    clusterAttribute="type"
  />
);

export const LabelsOnly = () => (
  <GraphCanvas
    theme={{
      ...lightTheme,
      cluster: {
        ...lightTheme.cluster,
        stroke: null
      }
    }}
    nodes={clusterNodes}
    draggable
    edges={clusterEdges}
    clusterAttribute="type"
  />
);

export const Custom = () => (
  <GraphCanvas
    theme={lightTheme}
    nodes={clusterNodes}
    draggable
    edges={clusterEdges}
    clusterAttribute="type"
    onRenderCluster={({ label, opacity, outerRadius, innerRadius, theme }) => (
      <>
        <Ring
          outerRadius={outerRadius}
          innerRadius={innerRadius}
          padding={40}
          normalizedFill={new Color('#075985')}
          normalizedStroke={new Color('#075985')}
          opacity={opacity}
          theme={theme ?? lightTheme}
          animated
        />
        {label && (
          <a.group position={label.position as any}>
            <Html as="div" center distanceFactor={500}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <svg
                  fill="#7CA0AB"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 30 30"
                  width="50px"
                  height="50px"
                >
                  <path d="M28,6.937c-0.957,0.425-1.985,0.711-3.064,0.84c1.102-0.66,1.947-1.705,2.345-2.951c-1.03,0.611-2.172,1.055-3.388,1.295 c-0.973-1.037-2.359-1.685-3.893-1.685c-2.946,0-5.334,2.389-5.334,5.334c0,0.418,0.048,0.826,0.138,1.215 c-4.433-0.222-8.363-2.346-10.995-5.574C3.351,6.199,3.088,7.115,3.088,8.094c0,1.85,0.941,3.483,2.372,4.439 c-0.874-0.028-1.697-0.268-2.416-0.667c0,0.023,0,0.044,0,0.067c0,2.585,1.838,4.741,4.279,5.23 c-0.447,0.122-0.919,0.187-1.406,0.187c-0.343,0-0.678-0.034-1.003-0.095c0.679,2.119,2.649,3.662,4.983,3.705 c-1.825,1.431-4.125,2.284-6.625,2.284c-0.43,0-0.855-0.025-1.273-0.075c2.361,1.513,5.164,2.396,8.177,2.396 c9.812,0,15.176-8.128,15.176-15.177c0-0.231-0.005-0.461-0.015-0.69C26.38,8.945,27.285,8.006,28,6.937z" />
                </svg>
                <span style={{ fontSize: 24 }}>{label.text}</span>
              </div>
            </Html>
          </a.group>
        )}
      </>
    )}
  />
);

export const ThreeDimensions = () => (
  <GraphCanvas
    nodes={clusterNodesWithSizes}
    draggable
    edges={[]}
    layoutType="forceDirected3d"
    clusterAttribute="type"
  >
    <directionalLight position={[0, 5, -4]} intensity={1} />
  </GraphCanvas>
);

export const Partial = () => (
  <GraphCanvas
    nodes={clusterNodes}
    draggable
    edges={[]}
    clusterAttribute="segment"
  />
);
