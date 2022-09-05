import React, { useState } from 'react';
import { GraphCanvas, Icon, LayoutTypes, SphereWithIcon } from '../../src';
import {
  iconNodes,
  manyNodes,
  simpleEdges,
  simpleNodes,
  simpleNodesColors
} from '../assets/demo';

export default {
  title: 'Demos/Nodes',
  component: GraphCanvas
};

export const NoEdges = () => <GraphCanvas nodes={manyNodes} edges={[]} />;

export const Icons = () => (
  <GraphCanvas
    nodes={iconNodes}
    edges={simpleEdges}
    renderNode={({ id, node, animated, nodeSize, opacity }) => (
      <Icon
        id={id}
        image={node.icon || ''}
        size={nodeSize + 8}
        opacity={opacity}
        animated={animated}
      />
    )}
  />
);

export const Custom3DNode = () => (
  <GraphCanvas
    nodes={simpleNodes}
    edges={simpleEdges}
    cameraMode="rotate"
    renderNode={({ node, active, nodeSize, theme, opacity }) => (
      <group>
        <mesh>
          <torusKnotGeometry attach="geometry" args={[nodeSize, 1.25, 50, 8]} />
          <meshBasicMaterial
            attach="material"
            color={
              active ? theme.node.activeFill : node.fill || theme.node.fill
            }
            opacity={opacity}
            transparent
          />
        </mesh>
      </group>
    )}
  />
);

export const SphereWithIconNode = () => (
  <GraphCanvas
    nodes={iconNodes}
    edges={simpleEdges}
    cameraMode="rotate"
    renderNode={({ id, node, active, nodeSize, theme, opacity, animated }) => (
      <SphereWithIcon
        id={id}
        size={nodeSize}
        color={active ? theme.node.activeFill : node.fill || theme.node.fill}
        opacity={opacity}
        animated={animated}
        iconSrc={node.icon || ''}
      />
    )}
  />
);

export const Colors = () => (
  <GraphCanvas nodes={simpleNodesColors} edges={simpleEdges} />
);

export const Draggable = () => {
  const [layout, setLayout] = useState<LayoutTypes>('forceDirected2d');
  const [nodes, setNodes] = useState(simpleNodes);

  return (
    <div>
      <button
        style={{
          position: 'absolute',
          top: 15,
          right: 15,
          zIndex: 999,
          width: 120
        }}
        onClick={() =>
          setNodes([
            ...nodes,
            { id: `n-${nodes.length}`, label: `Node ${nodes.length}` }
          ])
        }
      >
        Update Nodes
      </button>
      <button
        style={{
          position: 'absolute',
          top: 40,
          right: 15,
          zIndex: 999,
          width: 120
        }}
        onClick={() =>
          setLayout(
            layout === 'forceDirected2d' ? 'forceDirected3d' : 'forceDirected2d'
          )
        }
      >
        Reset Layout
      </button>
      <GraphCanvas
        nodes={nodes}
        edges={simpleEdges}
        draggable
        layoutType={layout}
      />
    </div>
  );
};
