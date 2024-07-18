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
    renderNode={({ node, ...rest }) => (
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
    renderNode={({ node, ...rest }) => (
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
    renderNode={({ node, ...rest }) => (
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


export const CustomActiveFillNode = () => (
  <GraphCanvas
    layoutType='hierarchicalTd'
    draggable
    nodes={[
      {
        "id": "n-0",
        "label": "FRANCIS FAMILY OFFICE LIMITED FRANCIS FAMILY OFFICE LIMITED FRANCIS FAMILY OFFICE LIMITED FRANCIS FAMILY OFFICE LIMITED FRANCIS FAMILY OFFICE LIMITED FRANCIS FAMILY OFFICE LIMITED FRANCIS FAMILY OFFICE LIMITED FRANCIS FAMILY OFFICE LIMITED",
        "activeFill": "yellow",
        "data": {
          "priority": 6
        },
      },
      {
        "id": "n-1",
        "label": "FRANCIS FAMILY OFFICE LIMITED",
        "activeFill": "red",
        "data": {
          "priority": 0
        },
      },
      {
        "id": "n-2",
        "label": "Node 2",
        "activeFill": "orange",
        "data": {
          "priority": 3
        }
      },
      {
        "id": "n-3",
        "label": "Node 3",
        "activeFill": "green",
        "data": {
          "priority": 1
        }
      },
      {
        "id": "n-4",
        "label": "Node 4",
        "activeFill": "pink",
        "data": {
          "priority": 2
        }
      },
      {
        "id": "n-5",
        "label": "Node 5",
        "activeFill": "magenta",
        "data": {
          "priority": 2
        }
      }
    ]}
    edges={[{
      id: '0->1',
      source: 'n-0',
      target: 'n-1',
      label: 'Edge 0-1',
    },
    {
      id: '0->2',
      source: 'n-0',
      target: 'n-2',
      label: 'Edge 0-2',
    },
    {
      id: '0->3',
      source: 'n-0',
      target: 'n-3',
      label: 'Edge 0-3'
    },
    {
      id: '0->4',
      source: 'n-0',
      target: 'n-4',
      label: 'Edge 0-4'
    },
    {
      id: '1->5',
      source: 'n-4',
      target: 'n-5',
      label: 'Edge 0-5'
    },
    {
      id: '3->5',
      source: 'n-3',
      target: 'n-5',
      label: 'Edge 3-5'
    },
    {
      id: '2->3',
      source: 'n-2',
      target: 'n-3',
      label: 'Edge 2-3'
    }
    ]}
  />
);
