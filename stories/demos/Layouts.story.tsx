import React, { useCallback, useState } from 'react';

import type { LayoutFactoryProps, NodePositionArgs } from '../../src';
import { GraphCanvas, recommendLayout } from '../../src';
import {
  complexEdges,
  complexNodes,
  simpleEdges,
  simpleNodes
} from '../assets/demo';

export default {
  title: 'Demos/Layouts',
  component: GraphCanvas
};

export const Recommender = () => {
  const layout = recommendLayout(complexNodes, complexEdges);

  return (
    <GraphCanvas
      layoutType={layout}
      nodes={complexNodes}
      edges={complexEdges}
    />
  );
};

export const Overrides = () => (
  <GraphCanvas
    layoutType="forceDirected2d"
    layoutOverrides={{
      nodeStrength: -50,
      linkDistance: 500
    }}
    nodes={complexNodes}
    edges={complexEdges}
  />
);

export const Custom = () => (
  <GraphCanvas
    layoutType="custom"
    layoutOverrides={
      {
        getNodePosition: (id: string, { nodes }: NodePositionArgs) => {
          const idx = nodes.findIndex(n => n.id === id);
          return {
            x: 25 * idx,
            y: idx % 2 === 0 ? 0 : 50,
            z: 1
          };
        }
      } as LayoutFactoryProps
    }
    nodes={simpleNodes}
    edges={simpleEdges}
  />
);

export const Draggable = () => {
  const [nodes, setNodes] = useState(simpleNodes);

  const addNode = useCallback(() => {
    const next = nodes.length;
    setNodes(prev => [
      ...prev,
      {
        id: `n-${next}`,
        label: `Node ${next}`,
        fill: '#3730a3'
      }
    ]);
  }, [nodes]);

  return (
    <>
      <GraphCanvas
        draggable
        layoutType="custom"
        layoutOverrides={
          {
            getNodePosition: (
              id: string,
              { nodes, drags }: NodePositionArgs
            ) => {
              const dragPosition = drags?.[id]?.position;
              if (dragPosition) {
                return dragPosition;
              }

              const idx = nodes.findIndex(n => n.id === id);
              return {
                x: 25 * idx,
                y: idx % 2 === 0 ? 0 : 50,
                z: 1
              };
            }
          } as LayoutFactoryProps
        }
        nodes={nodes}
        edges={simpleEdges}
      />
      <div style={{ zIndex: 9, position: 'absolute', top: 15, right: 15 }}>
        <button type="button" onClick={addNode}>
          Add node
        </button>
      </div>
    </>
  );
};
