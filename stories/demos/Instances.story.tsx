import React, {
  RefObject,
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
  parentEdges,
  parentNodes,
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
import { InstancedIcon } from '../../src/symbols/instances/InstancedIcon';
import { InstancedMeshSphere } from '../../src/symbols/instances/InstancedMeshSphere';
import { InstancedMeshRings } from '../../src/symbols/instances/InstancesMeshRing';

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

const NODES_WITH_ICONS = complexNodes.map((node, index) => ({
  ...node,
  icon: iconMap[Object.keys(iconMap)[index % Object.keys(iconMap).length]]
}));

const NODES_WITH_CLUSTER = [
  {
    id: 'n-0',
    label: 'MD5 0',
    fill: '#075985',
    data: {
      type: 'MD5',
      segment: 'A'
    }
  },
  {
    id: 'n-1',
    label: 'Email 1',
    fill: '#166534',
    data: {
      type: 'Email'
    }
  },
  {
    id: 'n-2',
    label: 'MD5 2',
    fill: '#075985',
    data: {
      type: 'MD5',
      segment: 'A'
    }
  },
  {
    id: 'n-3',
    label: 'URL 3',
    fill: '#c2410c',
    data: {
      type: 'URL'
    }
  },
  {
    id: 'n-4',
    label: 'MD5 4',
    fill: '#075985',
    data: {
      type: 'MD5',
      segment: 'A'
    }
  },
  {
    id: 'n-5',
    label: 'MD5 5',
    fill: '#075985',
    data: {
      type: 'MD5'
    }
  },
  {
    id: 'n-6',
    label: 'IP 6',
    fill: '#3730a3',
    data: {
      type: 'IP',
      segment: 'A'
    }
  },
  {
    id: 'n-7',
    label: 'IP 7',
    fill: '#3730a3',
    data: {
      type: 'IP'
    }
  },
  {
    id: 'n-8',
    label: 'URL 8',
    fill: '#c2410c',
    data: {
      type: 'URL',
      segment: 'A'
    }
  },
  {
    id: 'n-9',
    label: 'MD5 9',
    fill: '#075985',
    data: {
      type: 'MD5'
    }
  },
  {
    id: 'n-10',
    label: 'URL 10',
    fill: '#c2410c',
    data: {
      type: 'URL',
      segment: 'A'
    }
  },
  {
    id: 'n-11',
    label: 'URL 11',
    fill: '#c2410c',
    data: {
      type: 'URL'
    }
  },
  {
    id: 'n-12',
    label: 'URL 12',
    fill: '#c2410c',
    data: {
      type: 'URL',
      segment: 'A'
    }
  },
  {
    id: 'n-13',
    label: 'Email 13',
    fill: '#166534',
    data: {
      type: 'Email'
    }
  },
  {
    id: 'n-14',
    label: 'URL 14',
    fill: '#c2410c',
    data: {
      type: 'URL',
      segment: 'A'
    }
  },
  {
    id: 'n-15',
    label: 'IP 15',
    fill: '#3730a3',
    data: {
      type: 'IP'
    }
  },
  {
    id: 'n-16',
    label: 'Email 16',
    fill: '#166534',
    data: {
      type: 'Email',
      segment: 'A'
    }
  },
  {
    id: 'n-17',
    label: 'Email 17',
    fill: '#166534',
    data: {
      type: 'Email'
    }
  },
  {
    id: 'n-18',
    label: 'URL 18',
    fill: '#c2410c',
    data: {
      type: 'URL',
      segment: 'A'
    }
  },
  {
    id: 'n-19',
    label: 'Email 19',
    fill: '#166534',
    data: {
      type: 'Email'
    }
  },
  {
    id: 'n-20',
    label: 'Email 20',
    fill: '#166534',
    data: {
      type: 'Email',
      segment: 'A'
    }
  },
  {
    id: 'n-21',
    label: 'Email 21',
    fill: '#166534',
    data: {
      type: 'Email'
    }
  },
  {
    id: 'n-22',
    label: 'Email 22',
    fill: '#166534',
    data: {
      type: 'Email',
      segment: 'A'
    }
  },
  {
    id: 'n-23',
    label: 'URL 23',
    fill: '#c2410c',
    data: {
      type: 'URL'
    }
  },
  {
    id: 'n-24',
    label: 'Email 24',
    fill: '#166534',
    data: {
      type: 'Email',
      segment: 'A'
    }
  }
];

export const Spheres = () => {
  return <GraphCanvas nodes={simpleNodes} edges={simpleEdges} useInstances />;
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
      useInstances
      selections={selections}
      onCanvasClick={onCanvasClick}
      onNodeClick={onNodeClick}
    />
  );
};

export const LassoSelection = () => {
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
        useInstances
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
      useInstances
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
      useInstances
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
      useInstances
      nodes={complexNodes}
      edges={complexEdges}
      selections={selections}
      actives={actives}
      onCanvasClick={onCanvasClick}
      onNodeClick={onNodeClick}
    />
  );
};

export const IconInstances = () => {
  const graphRef = useRef<GraphCanvasRef | null>(null);
  const nodes = complexNodes.map((node, index) => ({
    ...node,
    icon: iconMap[Object.keys(iconMap)[index % Object.keys(iconMap).length]]
  }));
  const { selections, actives, onNodeClick, onCanvasClick } = useSelection({
    ref: graphRef,
    nodes: nodes,
    edges: complexEdges,
    pathSelectionType: 'all'
  });

  return (
    <GraphCanvas
      ref={graphRef}
      useInstances
      draggable
      nodes={nodes}
      edges={complexEdges}
      selections={selections}
      actives={actives}
      onCanvasClick={onCanvasClick}
      onNodeClick={onNodeClick}
    />
  );
};

export const Collapsible = () => (
  <GraphCanvas
    nodes={parentNodes}
    edges={parentEdges}
    useInstances
    contextMenu={({ data, onCollapse, isCollapsed, canCollapse, onClose }) => (
      <div
        style={{
          background: 'white',
          width: 150,
          border: 'solid 1px blue',
          borderRadius: 2,
          padding: 5,
          textAlign: 'center'
        }}
      >
        <h1>{data.label}</h1>
        {canCollapse && (
          <button onClick={onCollapse}>{isCollapsed ? 'Expand Node' : 'Collapse Node'}</button>
        )}
        <button onClick={onClose}>Close Menu</button>
      </div>
    )}
  />
);

export const Cluster = () => {
  const [nodes, setNodes] = useState(NODES_WITH_CLUSTER as any);

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
      <GraphCanvas
        nodes={nodes}
        draggable
        edges={[
          {
            source: 'n-6',
            target: 'n-1',
            id: 'n-6-n-1',
            label: 'n-6-n-1'
          }
        ]}
        clusterAttribute="type"
        useInstances
      />
      <div style={{ zIndex: 9, position: 'absolute', top: 15, right: 15 }}>
        <button type="button" onClick={addNode}>
          Add node
        </button>
      </div>
    </>
  );
};

export const CustomInstances = () => {
  const graphRef = useRef<GraphCanvasRef | null>(null);

  const { selections, onNodeClick, onCanvasClick } = useSelection({
    ref: graphRef,
    nodes: NODES_WITH_ICONS,
    edges: complexEdges,
    type: 'multi'
  });

  return (
    <GraphCanvas
      ref={graphRef}
      theme={darkTheme}
      draggable
      useInstances
      nodes={NODES_WITH_ICONS}
      edges={complexEdges}
      selections={selections}
      renderInstances={({
        instancesRef,
        nodes,
        selections,
        actives,
        animated,
        draggable,
        theme,
        draggingIds,
        hoveredNodeId,
        onPointerOver,
        onPointerOut,
        onPointerDown,
        onClick
      }) => (
        <>
          <InstancedMeshSphere
            ref={instancesRef[0]}
            nodes={nodes}
            selections={selections}
            actives={actives}
            animated={animated}
            draggable={draggable}
            theme={theme}
            draggingIds={draggingIds}
            hoveredNodeId={hoveredNodeId}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
            onPointerDown={onPointerDown}
            onClick={onClick}
          />
          <InstancedIcon
            nodes={nodes}
            selections={selections}
            actives={actives}
            animated={animated}
            draggable={draggable}
            theme={theme}
            draggingIds={draggingIds}
            hoveredNodeId={hoveredNodeId}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
            onPointerDown={onPointerDown}
          />
          <InstancedMeshRings
            ref={instancesRef[1]}
            theme={theme}
            nodes={
              selections.length
                ? nodes.filter(node => selections?.includes(node.id))
                : []
            }
            animated={false}
            draggable={draggable}
            selections={selections}
            draggingIds={draggingIds}
            onPointerDown={onPointerDown}
          />
        </>
      )}
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
        labelType="all"
        animated={true}
        draggable={true}
        useInstances={useInstances}
      >
        <Perf />
      </GraphCanvas>
    </div>
  );
};
