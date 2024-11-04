import React, { useCallback, useState } from 'react';
import { GraphCanvas, lightTheme } from '../../src';
import {
  clusterNodes,
  clusterEdges,
  random,
  singleNodeClusterNodes,
  imbalancedClusterNodes,
  manyClusterNodes
} from '../assets/demo';

export default {
  title: 'Demos/Cluster',
  component: GraphCanvas
};

export const Simple = () => {
  const [nodes, setNodes] = useState(clusterNodes);

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
      <GraphCanvas nodes={nodes} draggable edges={[]} clusterAttribute="type" />
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
