import React, { useRef, useState } from 'react';
import { GraphCanvas, LayoutTypes } from '../../src';
import { Svg, SphereWithIcon, SphereWithSvg } from '../../src/symbols';
import {
  iconNodes,
  manyNodes,
  simpleEdges,
  simpleNodes,
  simpleNodesColors
} from '../assets/demo';
import { commonArgTypes, commonArgs } from '../shared/storybook-args';

export default {
  title: 'Demos/Nodes',
  component: GraphCanvas,
  argTypes: commonArgTypes
};

const NoEdgesStory = args => <GraphCanvas {...args} />;

export const NoEdges = NoEdgesStory.bind({});
NoEdges.args = {
  ...commonArgs,
  nodes: manyNodes,
  edges: []
};

const IconsStory = args => <GraphCanvas {...args} />;

export const Icons = IconsStory.bind({});
Icons.args = {
  ...commonArgs,
  nodes: iconNodes,
  edges: simpleEdges
};

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

const Custom3DNodeStory = args => (
  <GraphCanvas
    {...args}
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

export const Custom3DNode = Custom3DNodeStory.bind({});
Custom3DNode.args = {
  ...commonArgs,
  nodes: simpleNodes,
  edges: simpleEdges,
  cameraMode: 'rotate'
};

const SphereWithIconNodeStory = args => (
  <GraphCanvas
    {...args}
    renderNode={({  node, ...rest }) => (
      <SphereWithIcon
        {...rest}
        node={node}
        image={node.icon || ''}
      />
    )}
  />
);

export const SphereWithIconNode = SphereWithIconNodeStory.bind({});
SphereWithIconNode.args = {
  ...commonArgs,
  nodes: iconNodes,
  edges: simpleEdges,
  cameraMode: 'rotate'
};

const SphereSvgIconNodeStory = args => (
  <GraphCanvas
    {...args}
    renderNode={({  node, ...rest }) => (
      <SphereWithSvg
        {...rest}
        node={node}
        image={node.icon || ''}
      />
    )}
  />
);

export const SphereSvgIconNode = SphereSvgIconNodeStory.bind({});
SphereSvgIconNode.args = {
  ...commonArgs,
  nodes: iconNodes,
  edges: simpleEdges,
  cameraMode: 'rotate'
};

const SvgIconNodeStory = args => (
  <GraphCanvas
    {...args}
    renderNode={({  node, ...rest }) => (
      <Svg
        {...rest}
        node={node}
        image={node.icon || ''}
      />
    )}
  />
);

export const SvgIconNode = SvgIconNodeStory.bind({});
SvgIconNode.args = {
  ...commonArgs,
  nodes: iconNodes,
  edges: simpleEdges,
  cameraMode: 'rotate'
};

const ColorsStory = args => <GraphCanvas {...args} />;

export const Colors = ColorsStory.bind({});
Colors.args = {
  ...commonArgs,
  nodes: simpleNodesColors,
  edges: simpleEdges
};

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
