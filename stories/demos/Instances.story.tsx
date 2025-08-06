import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { Perf } from 'r3f-perf';

import {
  darkTheme,
  GraphCanvas,
  GraphCanvasRef,
  GraphEdge,
  GraphNode,
  useSelection
} from '../../src';
import {
  complexEdges,
  complexNodes,
  simpleEdges,
  simpleNodes
} from '../assets/demo';

import fireSvg from '../assets/fire.svg';
import flagSvg from '../assets/flag.svg';
import userSvg from '../assets/user.svg';
import twitterSvg from '../assets/twitter.svg';
import keySvg from '../assets/key.svg';
import trumpSvg from '../assets/trump.svg';
import govSvg from '../assets/gov.svg';
import productSvg from '../assets/product.svg';
import missleSvg from '../assets/missle.svg';

export default {
  title: 'Demos/Instances',
  component: GraphCanvas
};

const iconMap = {
  Incident: fireSvg,
  Country: flagSvg,
  Province: flagSvg,
  Place: flagSvg,
  Continent: flagSvg,
  Username: userSvg,
  Person: userSvg,
  'twitter.com': twitterSvg,
  Keyphrase: keySvg,
  'Donald Trump': trumpSvg,
  GovernmentBody: govSvg,
  MilitaryEquipment: missleSvg,
  Product: productSvg
};

export const Spheres = () => {
  return (
    <GraphCanvas
      nodes={simpleNodes}
      edges={simpleEdges}
      useInstances={true}
      theme={darkTheme}
    />
  );
};

export const Selections = () => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const { selections, onNodeClick, onCanvasClick } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    type: 'multi'
  });

  return (
    <GraphCanvas
      ref={graphRef}
      nodes={complexNodes}
      edges={complexEdges}
      useInstances={true}
      selections={selections}
      onCanvasClick={onCanvasClick}
      onNodeClick={onNodeClick}
      theme={darkTheme}
    />
  );
};

export const LassoSelectionNotWorking = () => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const {
    actives,
    selections,
    onNodeClick,
    onCanvasClick,
    onLasso,
    onLassoEnd
  } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    type: 'multi'
  });

  return (
    <>
      <div
        style={{
          zIndex: 9,
          userSelect: 'none',
          position: 'absolute',
          top: 0,
          right: 0,
          background: 'rgba(0, 0, 0, .5)',
          color: 'white'
        }}
      >
        <h3 style={{ margin: 5 }}>Hold Shift and Drag to Lasso</h3>
      </div>
      <GraphCanvas
        ref={graphRef}
        useInstances={true}
        theme={darkTheme}
        nodes={complexNodes}
        edges={complexEdges}
        selections={selections}
        actives={actives}
        onNodeClick={onNodeClick}
        onCanvasClick={onCanvasClick}
        lassoType="all"
        onLasso={onLasso}
        onLassoEnd={onLassoEnd}
      />
    </>
  );
};

export const Draggable = () => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const { selections, onNodeClick, onCanvasClick } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    type: 'multi'
  });

  return (
    <GraphCanvas
      ref={graphRef}
      draggable
      useInstances={true}
      theme={darkTheme}
      nodes={complexNodes}
      edges={complexEdges}
      selections={selections}
      onCanvasClick={onCanvasClick}
      onNodeClick={onNodeClick}
    />
  );
};

export const HighlightHover = () => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const {
    selections,
    actives,
    onNodeClick,
    onCanvasClick,
    onNodePointerOver,
    onNodePointerOut
  } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    pathHoverType: 'all'
  });

  return (
    <GraphCanvas
      ref={graphRef}
      theme={darkTheme}
      useInstances={true}
      nodes={complexNodes}
      edges={complexEdges}
      selections={selections}
      actives={actives}
      onNodePointerOver={onNodePointerOver}
      onNodePointerOut={onNodePointerOut}
      onCanvasClick={onCanvasClick}
      onNodeClick={onNodeClick}
    />
  );
};

export const HighlightClick = () => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const { selections, actives, onNodeClick, onCanvasClick } = useSelection({
    ref: graphRef,
    nodes: complexNodes,
    edges: complexEdges,
    pathSelectionType: 'all'
  });

  return (
    <GraphCanvas
      ref={graphRef}
      theme={darkTheme}
      useInstances={true}
      nodes={complexNodes}
      edges={complexEdges}
      selections={selections}
      actives={actives}
      onCanvasClick={onCanvasClick}
      onNodeClick={onNodeClick}
    />
  );
};

export const Performance = () => {
  const ref = useRef<GraphCanvasRef | null>(null);
  const [nodeCount, setNodeCount] = useState(1000);
  const [tempNodeCount, setTempNodeCount] = useState(nodeCount);
  const [edgeCount, setEdgeCount] = useState(100);
  const [tempEdgeCount, setTempEdgeCount] = useState(edgeCount);
  const [useInstances, setUseInstances] = useState(true);
  const [nodes, setNodes] = useState<DemoNode[]>([]);
  const [edges, setEdges] = useState<DemoEdge[]>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const edgeDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setNodeCount(tempNodeCount);
    }, 1000);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [tempNodeCount]);

  useEffect(() => {
    if (edgeDebounceTimer.current) {
      clearTimeout(edgeDebounceTimer.current);
    }

    edgeDebounceTimer.current = setTimeout(() => {
      setEdgeCount(tempEdgeCount);
    }, 1000);

    return () => {
      if (edgeDebounceTimer.current) {
        clearTimeout(edgeDebounceTimer.current);
      }
    };
  }, [tempEdgeCount]);

  useEffect(() => {
    const n: DemoNode[] = [];
    for (let i = 0; i < nodeCount; i++) {
      n.push({
        id: `node-${i}`,
        label: Array.from(
          { length: Math.floor(Math.random() * 7) + 1 },
          () =>
            [
              'lorem',
              'ipsum',
              'dolor',
              'sit',
              'amet',
              'consectetur',
              'adipiscing',
              'elit'
            ][Math.floor(Math.random() * 8)]
        ).join(' '),
        fill: `#${Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, '0')}`,
        size: Math.floor(Math.random() * 81) + 20
        // icon: i % 2 === 0 ? twitterSvg : fireSvg
      });
    }

    const e: DemoEdge[] = [];
    for (let i = 0; i < edgeCount; i++) {
      const sourceIndex = Math.floor(Math.random() * nodeCount);
      let targetIndex = Math.floor(Math.random() * nodeCount);
      while (targetIndex === sourceIndex) {
        targetIndex = Math.floor(Math.random() * nodeCount);
      }
      e.push({
        id: `edge-${i}`,
        source: `node-${sourceIndex}`,
        target: `node-${targetIndex}`,
        label: `Edge ${i}`,
        labelVisible: true
      });
    }

    setNodes(n);
    setEdges(e);
  }, [nodeCount, edgeCount]);

  interface DemoNode extends GraphNode {
    id: string;
    label: string;
  }

  interface DemoEdge extends GraphEdge {
    id: string;
    source: string;
    target: string;
    label: string;
    labelVisible: boolean;
  }

  const addNode = useCallback(() => {
    const next = nodes.length + 2;
    setNodes(prev => [
      ...prev,
      {
        id: `${next}`,
        label: `Node ${next}`,
        size: 100,
        fill: '#ffffff',
        icon: keySvg
      }
    ]);
  }, [nodes]);

  return (
    <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
      <div
        style={{
          zIndex: 9,
          position: 'absolute',
          top: 175,
          right: 15,
          background: 'rgba(0, 0, 0, .5)',
          padding: 1,
          color: 'white'
        }}
      >
        <div
          style={{
            padding: '10px 5px',
            borderBottom: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            <input
              type="checkbox"
              checked={useInstances}
              onChange={e => setUseInstances(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Use Instances
          </label>
        </div>
        <button style={{ display: 'block', width: '100%' }} onClick={addNode}>
          Add Node
        </button>
        <div
          style={{
            padding: '10px 5px',
            borderBottom: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <label
            style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}
          >
            Node Count: {tempNodeCount}
          </label>
          <input
            type="range"
            min="10"
            max="5000"
            step="100"
            value={tempNodeCount}
            onChange={e => setTempNodeCount(Number(e.target.value))}
            style={{
              width: '100%',
              height: '20px',
              background: 'rgba(255,255,255,0.2)',
              outline: 'none',
              borderRadius: '3px'
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '10px',
              marginTop: '2px'
            }}
          >
            <span>10</span>
            <span>5,000</span>
          </div>
        </div>
        <div
          style={{
            padding: '10px 5px',
            borderBottom: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <label
            style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}
          >
            Edge Count: {tempEdgeCount}
          </label>
          <input
            type="range"
            min="10"
            max="1000"
            step="10"
            value={tempEdgeCount}
            onChange={e => setTempEdgeCount(Number(e.target.value))}
            style={{
              width: '100%',
              height: '20px',
              background: 'rgba(255,255,255,0.2)',
              outline: 'none',
              borderRadius: '3px'
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '10px',
              marginTop: '2px'
            }}
          >
            <span>10</span>
            <span>1,000</span>
          </div>
        </div>
        <button
          style={{ display: 'block', width: '100%' }}
          onClick={() => ref.current?.centerGraph()}
        >
          Center
        </button>
        <button
          style={{ display: 'block', width: '100%' }}
          onClick={() => ref.current?.fitNodesInView([nodes[2].id])}
        >
          Fit Node 2
        </button>
        <button
          style={{ display: 'block', width: '100%' }}
          onClick={() => ref.current?.fitNodesInView()}
        >
          Fit View
        </button>
        <br />
        <button
          style={{ display: 'block', width: '100%' }}
          onClick={() => ref.current?.zoomIn()}
        >
          Zoom In
        </button>
        <button
          style={{ display: 'block', width: '100%' }}
          onClick={() => ref.current?.zoomOut()}
        >
          Zoom Out
        </button>
        <button
          style={{ display: 'block', width: '100%' }}
          onClick={() => ref.current?.dollyIn()}
        >
          Dolly In
        </button>
        <button
          style={{ display: 'block', width: '100%' }}
          onClick={() => ref.current?.dollyOut()}
        >
          Dolly Out
        </button>
        <br />
        <button
          style={{ display: 'block', width: '100%' }}
          onClick={() => ref.current?.panDown()}
        >
          Pan Down
        </button>
        <button
          style={{ display: 'block', width: '100%' }}
          onClick={() => ref.current?.panUp()}
        >
          Pan Up
        </button>
        <button
          style={{ display: 'block', width: '100%' }}
          onClick={() => ref.current?.panLeft()}
        >
          Pan Left
        </button>
        <button
          style={{ display: 'block', width: '100%' }}
          onClick={() => ref.current?.panRight()}
        >
          Pan Right
        </button>
      </div>
      <GraphCanvas
        ref={ref}
        nodes={nodes}
        edges={edges}
        theme={darkTheme}
        cameraMode="orbit"
        layoutType='forceDirected3d'
        labelType="all"
        // labelType="none"
        animated={true}
        draggable={true}
        useInstances={useInstances}
      >
        <Perf />
      </GraphCanvas>
    </div>
  );
};
