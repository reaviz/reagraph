import React, { useEffect, useRef, useState } from 'react';
import { GraphCanvas, GraphCanvasRef, lightTheme } from '../../src';
import {
  parentEdges,
  parentNodes,
  simpleEdges,
  simpleNodes,
  random
} from '../assets/demo';
import { range } from 'd3-array';
import { commonArgTypes, commonArgs } from '../shared/storybook-args';

export default {
  title: 'Demos/Basic',
  component: GraphCanvas,
  argTypes: commonArgTypes
};

const SimpleStory = args => <GraphCanvas {...args} />;

export const Simple = SimpleStory.bind({});
Simple.args = {
  ...commonArgs,
  nodes: simpleNodes,
  edges: simpleEdges
};

const TwoWayLinkStory = args => (
  <GraphCanvas
    {...args}
    nodes={[
      {
        id: '1',
        label: '1'
      },
      {
        id: '2',
        label: '2'
      }
    ]}
    edges={[
      {
        source: '1',
        target: '2',
        id: '1-2',
        label: '1-2'
      },
      {
        source: '2',
        target: '1',
        id: '2-1',
        label: '2-1'
      }
    ]}
  />
);

export const TwoWayLink = TwoWayLinkStory.bind({});
TwoWayLink.args = {
  ...commonArgs
};

const SpecialCharactersStory = args => (
  <GraphCanvas
    {...args}
    nodes={[
      {
        id: '1',
        label: '牡'
      },
      {
        id: '2',
        label: '牡'
      }
    ]}
    edges={[
      {
        source: '1',
        target: '2',
        id: '1-2',
        label: '牡 - 牡'
      },
      {
        source: '2',
        target: '1',
        id: '2-1',
        label: '牡 - 牡'
      }
    ]}
  />
);

export const SpecialCharacters = SpecialCharactersStory.bind({});
SpecialCharacters.args = {
  ...commonArgs,
  labelType: 'all',
  labelFontUrl: 'https://ey2pz3.csb.app/NotoSansSC-Regular.ttf'
};

const DisabledStory = args => <GraphCanvas {...args} />;

export const Disabled = DisabledStory.bind({});
Disabled.args = {
  ...commonArgs,
  nodes: simpleNodes,
  edges: simpleEdges,
  disabled: true
};

const CustomLightingStory = args => (
  <GraphCanvas {...args}>
    <directionalLight position={[0, 5, -4]} intensity={1} />
  </GraphCanvas>
);

export const CustomLighting = CustomLightingStory.bind({});
CustomLighting.args = {
  ...commonArgs,
  nodes: simpleNodes,
  edges: simpleEdges,
  layoutType: 'forceDirected3d'
};

export const Many = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
    {range(10).map(i => (
      <div
        key={i}
        style={{
          border: 'solid 1px red',
          height: 350,
          width: 350,
          margin: 15,
          position: 'relative'
        }}
      >
        <GraphCanvas
          disabled
          nodes={simpleNodes}
          edges={simpleEdges}
          animated={false}
        />
      </div>
    ))}
  </div>
);

export const LiveUpdates = () => {
  const ref = useRef<GraphCanvasRef | null>(null);
  const [nodes, setNodes] = useState(simpleNodes);
  const [edges, setEdges] = useState(simpleEdges);

  useEffect(() => {
    ref.current?.fitNodesInView();
  }, [nodes]);

  return (
    <div>
      <div
        style={{
          zIndex: 9,
          position: 'absolute',
          top: 15,
          right: 15,
          background: 'rgba(0, 0, 0, .5)',
          padding: 1,
          color: 'white'
        }}
      >
        <button
          style={{ display: 'block', width: '100%' }}
          onClick={() => {
            const num = random(0, 1000);
            setNodes([...nodes, { id: `n-${num}`, label: `Node ${num}` }]);
            if (random(0, 2) !== 2) {
              setEdges([
                ...edges,
                {
                  id: `e-${num}`,
                  source: nodes[nodes.length - 1].id,
                  target: `n-${num}`
                }
              ]);
            }
          }}
        >
          Add Node
        </button>
        <button
          style={{ display: 'block', width: '100%' }}
          onClick={() => {
            setNodes(nodes.filter(n => n.id !== nodes[0]?.id));
          }}
        >
          Remove Node {nodes[0]?.id}
        </button>
      </div>
      <GraphCanvas ref={ref} nodes={nodes} edges={edges} />
    </div>
  );
};

export const SaveAsImage = () => {
  const ref = useRef<GraphCanvasRef | null>(null);
  return (
    <div>
      <div
        style={{
          zIndex: 9,
          position: 'absolute',
          top: 15,
          right: 15,
          background: 'rgba(0, 0, 0, .5)',
          padding: 1,
          color: 'white'
        }}
      >
        <button
          style={{ display: 'block', width: '100%' }}
          onClick={() => {
            const data = ref.current.exportCanvas();

            const link = document.createElement('a');
            link.setAttribute('href', data);
            link.setAttribute('target', '_blank');
            link.setAttribute('download', 'graph.png');
            link.click();
          }}
        >
          Export Graph
        </button>
      </div>
      <GraphCanvas ref={ref} nodes={simpleNodes} edges={simpleEdges} />
    </div>
  );
};

const NoAnimationStory = args => <GraphCanvas {...args} />;

export const NoAnimation = NoAnimationStory.bind({});
NoAnimation.args = {
  ...commonArgs,
  nodes: simpleNodes,
  edges: simpleEdges,
  animated: false
};

export const ExtraGlOptions = () => (
  <GraphCanvas
    animated={false}
    nodes={simpleNodes}
    edges={simpleEdges}
    glOptions={{ preserveDrawingBuffer: true }}
  />
);

export const NodeDoubleClick = () => (
  <GraphCanvas
    nodes={[
      {
        id: '1',
        label: 'Node 1'
      },
      {
        id: '2',
        label: 'Node 2'
      }
    ]}
    edges={[
      {
        source: '1',
        target: '2',
        id: '1-2',
        label: '1-2'
      },
      {
        source: '2',
        target: '1',
        id: '2-1',
        label: '2-1'
      }
    ]}
    onNodeDoubleClick={node => alert(node.label)}
  />
);
