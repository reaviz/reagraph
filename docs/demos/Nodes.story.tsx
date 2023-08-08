import React, { useRef, useState } from 'react';
import { GraphCanvas, Svg, LayoutTypes, SphereWithIcon, SphereWithSvg } from '../../src';
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
  />
);

export const DragOverrides = () => {
  const nodeRef = useRef(new Map());
  const [nodes, setNodes] = useState(simpleNodes);

  return (
    <>
      <GraphCanvas
        draggable
        nodes={nodes}
        edges={simpleEdges}
        layoutOverrides={{
          getNodePosition: (id) => {
            console.log('custom position', nodeRef.current.get(id))
            return nodeRef.current.get(id)?.position;
          }
        }}
        onNodeDragged={node => {
          console.log('node dragged', node);
          nodeRef.current.set(node.id, node);
        }}
      />
      <div style={{ zIndex: 9, position: 'absolute', top: 15, right: 15 }}>
        <button
          type="button"
          onClick={() => {
            const next = nodes.length + 2;
            setNodes([...nodes, { id: `${next}`, label: `Node ${next}` }])
          }}
        >
          Reset Graph
        </button>
      </div>
    </>
  );
};

export const Custom3DNode = () => (
  <GraphCanvas
    nodes={simpleNodes}
    edges={simpleEdges}
    cameraMode="rotate"
    renderNode={({ size, color, opacity }) => (
      <group>
        <mesh>
          <torusKnotGeometry attach="geometry" args={[size, 1.25, 50, 8]} />
          <meshBasicMaterial
            attach="material"
            color={color}
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
    renderNode={({  node, ...rest }) => (
      <SphereWithIcon
        {...rest}
        node={node}
        image={node.icon || ''}
      />
    )}
  />
);

export const SphereSvgIconNode = () => (
  <GraphCanvas
    nodes={iconNodes}
    edges={simpleEdges}
    cameraMode="rotate"
    renderNode={({  node, ...rest }) => (
      <SphereWithSvg
        {...rest}
        node={node}
        image={node.icon || ''}
      />
    )}
  />
);

export const SvgIconNode = () => (
  <GraphCanvas
    nodes={iconNodes}
    edges={simpleEdges}
    cameraMode="rotate"
    renderNode={({  node, ...rest }) => (
      <Svg
        {...rest}
        node={node}
        image={node.icon || ''}
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
