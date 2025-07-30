import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Perf } from 'r3f-perf';

import {
  darkTheme,
  GraphCanvas,
  GraphCanvasRef,
  GraphEdge,
  GraphNode,
  useSelection
} from '../../src';

import cyberJson from '../assets/cyber.json';
import mitreTools from '../assets/mitre-tools.json';
import mitreTechniques from '../assets/mitre-techniques.json';
import mitreTechniquesAll from '../assets/mitre-techniques-all.json';

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
  title: 'Demos/Use Cases',
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

export const CyberInvestigation = () => {
  const graphRef = useRef<GraphCanvasRef | null>(null);

  const [nodes, edges] = useMemo(() => {
    const n: GraphNode[] = [];
    const e: GraphEdge[] = [];

    for (const node of cyberJson) {
      const node1 = {
        id: node.ItemIdA,
        label: node.ItemDescriptionA,
        icon: iconMap[node.ItemTypeA] || iconMap[node.ItemDescriptionA]
      };

      if (!n.find(n => n.id === node1.id)) {
        n.push(node1);
      }

      const node2 = {
        id: node.ItemIdB,
        label: node.ItemDescriptionB,
        icon: iconMap[node.ItemTypeB] || iconMap[node.ItemDescriptionB]
      };

      if (!n.find(n => n.id === node2.id)) {
        n.push(node2);
      }

      const edge = {
        id: `${node1.id}-${node2.id}`,
        source: node1.id,
        target: node2.id
      };

      if (!e.find(e => e.id === edge.id)) {
        e.push(edge);
      }
    }

    return [n, e];
  }, []);

  const {
    selections,
    actives,
    onNodeClick,
    onCanvasClick,
    onNodePointerOver,
    onNodePointerOut
  } = useSelection({
    ref: graphRef,
    nodes,
    edges,
    pathSelectionType: 'out'
  });

  return (
    <GraphCanvas
      selections={selections}
      actives={actives}
      ref={graphRef}
      nodes={nodes}
      edges={edges}
      theme={darkTheme}
      draggable
      edgeInterpolation="curved"
      onCanvasClick={onCanvasClick}
      onNodeClick={onNodeClick}
      onNodePointerOver={onNodePointerOver}
      onNodePointerOut={onNodePointerOut}
    />
  );
};

export const MitreTools = () => {
  const [nodes, edges] = useMemo(() => {
    const n = [];
    const e = [];

    for (const node of mitreTools.nodes) {
      if (!n.find(nn => nn.id === node.id)) {
        n.push({
          id: node.id,
          label: node.attributes.name,
          data: node.attributes
        });
      }
    }

    for (const edge of mitreTools.links) {
      if (
        n.find(nn => nn.id === edge.source) &&
        n.find(nn => nn.id === edge.target)
      ) {
        e.push({
          id: `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target
        });
      }
    }

    return [n, e];
  }, []);

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
    nodes,
    edges,
    pathSelectionType: 'out'
  });

  return (
    <GraphCanvas
      selections={selections}
      actives={actives}
      ref={graphRef}
      nodes={nodes}
      edges={edges}
      theme={darkTheme}
      draggable
      labelType="nodes"
      edgeInterpolation="curved"
      onCanvasClick={onCanvasClick}
      onNodeClick={onNodeClick}
      onNodePointerOver={onNodePointerOver}
      onNodePointerOut={onNodePointerOut}
    />
  );
};

export const MitreTechniques = () => {
  const [nodes, edges] = useMemo(() => {
    const n = [];
    const e = [];

    for (const node of mitreTechniques.nodes) {
      if (!n.find(nn => nn.id === node.id)) {
        n.push({
          id: node.id,
          label: node.attributes.name,
          data: node.attributes
        });
      }
    }

    for (const edge of mitreTechniques.links) {
      if (
        n.find(nn => nn.id === edge.source) &&
        n.find(nn => nn.id === edge.target)
      ) {
        e.push({
          id: `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target
        });
      }
    }

    return [n, e];
  }, []);

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
    nodes,
    edges,
    pathSelectionType: 'out'
  });

  return (
    <GraphCanvas
      selections={selections}
      actives={actives}
      ref={graphRef}
      nodes={nodes}
      edges={edges}
      theme={darkTheme}
      labelType="nodes"
      draggable
      edgeInterpolation="curved"
      onCanvasClick={onCanvasClick}
      onNodeClick={onNodeClick}
      onNodePointerOver={onNodePointerOver}
      onNodePointerOut={onNodePointerOut}
    />
  );
};

export const MitreAllTechniques = () => {
  const [nodes, edges] = useMemo(() => {
    const n = [];
    const e = [];

    for (const node of mitreTechniquesAll.nodes) {
      if (!n.find(nn => nn.id === node.id)) {
        n.push({
          id: node.id,
          label: node.attributes.name,
          data: node.attributes
        });
      }
    }

    for (const edge of mitreTechniquesAll.links) {
      if (
        n.find(nn => nn.id === edge.source) &&
        n.find(nn => nn.id === edge.target)
      ) {
        e.push({
          id: `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target
        });
      }
    }

    return [n, e];
  }, []);

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
    nodes,
    edges,
    pathSelectionType: 'out'
  });

  return (
    <GraphCanvas
      selections={selections}
      actives={actives}
      ref={graphRef}
      nodes={nodes}
      edges={edges}
      theme={darkTheme}
      labelType="nodes"
      draggable
      edgeInterpolation="curved"
      onCanvasClick={onCanvasClick}
      onNodeClick={onNodeClick}
      onNodePointerOver={onNodePointerOver}
      onNodePointerOut={onNodePointerOut}
    />
  );
};

export const Performance = () => {
  const ref = useRef<GraphCanvasRef | null>(null);
  const [nodeCount, setNodeCount] = useState(10);
  const [edgeCount, setEdgeCount] = useState(10);
  const [nodes, setNodes] = useState<DemoNode[]>([]);
  const [edges, setEdges] = useState<DemoEdge[]>([]);

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
        size: Math.floor(Math.random() * 81) + 20,
        icon: i % 2 === 0 ? twitterSvg : fireSvg
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
        <button
          style={{ display: 'block', width: '100%' }}
          onClick={addNode}
        >
          Add Node
        </button>
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
        // cameraMode="rotate"
        // layoutType='forceDirected3d'
        labelType="all"
        // labelType="none"
        animated={true}
        draggable={true}
      >
        <Perf />
      </GraphCanvas>
    </div>
  );
};
