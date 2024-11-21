import React, { useCallback, useState } from 'react';
import { Billboard, Svg, Text } from 'glodrei';
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
    onRenderCluster={({
      label,
      opacity,
      outerRadius,
      innerRadius,
      theme
    }) => (
      <>
        <Ring
          outerRadius={outerRadius}
          innerRadius={innerRadius}
          padding={40}
          normalizedFill={new Color('#075985')}
          normalizedStroke={new Color('#075985')}
          circleOpacity={opacity}
          theme={theme ?? lightTheme}
        />
        {label && (
          <a.group position={label.position as any}>
            <Label
              text={label.text}
              opacity={label.opacity}
              fontUrl={label.fontUrl}
              stroke={theme?.cluster?.label?.stroke}
              active={false}
              color={new Color('#2A6475')}
              fontSize={theme?.cluster?.label?.fontSize ?? 12}
            />
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
