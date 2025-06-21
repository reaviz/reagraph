import React, { useRef, useState } from 'react';
import { CameraMode, GraphCanvas, GraphCanvasRef, LayoutTypes } from '../../src';
import { simpleEdges, simpleNodes } from '../assets/demo';
import { commonArgTypes, commonArgs } from '../shared/storybook-args';

export default {
  title: 'Demos/Controls',
  component: GraphCanvas,
  argTypes: commonArgTypes
};

const AllTemplate = (args) => {
  const ref = useRef<GraphCanvasRef | null>(null);

  return (
    <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
      <div style={{ zIndex: 9, position: 'absolute', top: 15, right: 15, background: 'rgba(0, 0, 0, .5)', padding: 1, color: 'white' }}>
        <button style={{ display: 'block', width: '100%' }} onClick={() => ref.current?.centerGraph()}>Center</button>
        <button style={{ display: 'block', width: '100%' }} onClick={() => ref.current?.centerGraph([simpleNodes[2].id])}>Center Node 2</button>
        <button style={{ display: 'block', width: '100%' }} onClick={() => ref.current?.fitNodesInView()}>Fit View</button>
        <br />
        <button style={{ display: 'block', width: '100%' }} onClick={() => ref.current?.zoomIn()}>Zoom In</button>
        <button style={{ display: 'block', width: '100%' }} onClick={() => ref.current?.zoomOut()}>Zoom Out</button>
        <button style={{ display: 'block', width: '100%' }} onClick={() => ref.current?.dollyIn()}>Dolly In</button>
        <button style={{ display: 'block', width: '100%' }} onClick={() => ref.current?.dollyOut()}>Dolly Out</button>
        <br />
        <button style={{ display: 'block', width: '100%' }} onClick={() => ref.current?.panDown()}>Pan Down</button>
        <button style={{ display: 'block', width: '100%' }} onClick={() => ref.current?.panUp()}>Pan Up</button>
        <button style={{ display: 'block', width: '100%' }} onClick={() => ref.current?.panLeft()}>Pan Left</button>
        <button style={{ display: 'block', width: '100%' }} onClick={() => ref.current?.panRight()}>Pan Right</button>
      </div>
      <GraphCanvas {...args} ref={ref} nodes={simpleNodes} edges={simpleEdges} />
    </div>
  );
};

export const All = AllTemplate.bind({});
All.args = {
  ...commonArgs
};

const RotateTemplate = (args) => (
  <GraphCanvas {...args} nodes={simpleNodes} edges={simpleEdges} />
);

export const Rotate = RotateTemplate.bind({});
Rotate.args = {
  ...commonArgs,
  cameraMode: 'rotate'
};

const OrbitTemplate = (args) => {
  const [mode, setMode] = useState<CameraMode>('orbit');

  return (
    <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
      <div style={{ zIndex: 9, position: 'absolute', top: 15, right: 15, background: 'rgba(0, 0, 0, .5)', padding: 1, color: 'white' }}>
        <button style={{ display: 'block', width: '100%' }} onClick={() => setMode(mode === 'orbit' ? 'rotate' : 'orbit')}>Enable/Disable Orbit</button>
      </div>
      <GraphCanvas {...args} cameraMode={mode} nodes={simpleNodes} edges={simpleEdges} />
    </div>
  );
};

export const Orbit = OrbitTemplate.bind({});
Orbit.args = {
  ...commonArgs,
  cameraMode: 'orbit'
};
