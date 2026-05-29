import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import type {
  CosmosGraphCanvasRef,
  GraphCanvasRef,
  GraphEdge,
  GraphNode,
  LayoutFactoryProps,
  NodePositionArgs,
  RenderEngine
} from '../../src';
import { GraphCanvas } from '../../src';

export default {
  title: 'Demos/Large Graph',
  component: GraphCanvas
};

const NODE_COUNT = 5000;
const EDGE_COUNT = 12000;
const GROUP_COUNT = 16;
const GROUP_RADIUS = 2800;
const NODE_SPACING = 34;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

const COLORS = [
  '#2563eb',
  '#0891b2',
  '#059669',
  '#65a30d',
  '#ca8a04',
  '#dc2626',
  '#be185d',
  '#7c3aed'
];

const graphButtonStyle = (active: boolean): React.CSSProperties => ({
  border: 0,
  borderRadius: 3,
  color: active ? '#111827' : '#e5e7eb',
  cursor: active ? 'default' : 'pointer',
  fontWeight: 600,
  padding: '6px 10px',
  background: active ? '#f9fafb' : 'rgba(255, 255, 255, 0.14)'
});

interface StoryStats {
  fps: number;
  zoom: number;
}

interface GraphOverlayProps {
  edges: GraphEdge[];
  graphRef: React.RefObject<
    (GraphCanvasRef & Partial<CosmosGraphCanvasRef>) | null
  >;
  interactionLabel: string;
  nodes: GraphNode[];
  renderEngine: RenderEngine;
  setRenderEngine: (engine: RenderEngine) => void;
}

interface NodeConnections {
  edgeCount: number;
  ids: string[];
  neighborCount: number;
}

const EMPTY_IDS: string[] = [];
const COSMOS_CONFIG = {
  fitViewDelay: 0,
  fitViewDuration: 0,
  labelMaxCount: GROUP_COUNT,
  labelUpdateInterval: 50,
  linkOpacity: 1,
  linkVisibilityMinTransparency: 1,
  linkWidthScale: 2.4,
  pointSamplingDistance: 260,
  scaleLinksOnZoom: true
};

const getNodeLayoutPosition = (index: number, data?: GraphNode['data']) => {
  const group = index % GROUP_COUNT;
  const groupAngle = (group / GROUP_COUNT) * Math.PI * 2;
  const groupCenterX = Math.cos(groupAngle) * GROUP_RADIUS;
  const groupCenterY = Math.sin(groupAngle) * GROUP_RADIUS;
  const localIndex = Math.floor(index / GROUP_COUNT);
  const localRadius = NODE_SPACING * Math.sqrt(localIndex);
  const localAngle = localIndex * GOLDEN_ANGLE;

  return {
    x: groupCenterX + Math.cos(localAngle) * localRadius,
    y: groupCenterY + Math.sin(localAngle) * localRadius,
    z: 1,
    data
  };
};

function createLargeGraph() {
  const nodes: GraphNode[] = Array.from({ length: NODE_COUNT }, (_, index) => {
    const group = index % GROUP_COUNT;
    const localIndex = Math.floor(index / GROUP_COUNT);
    const isLabelAnchor = localIndex === 0;

    return {
      id: `n-${index}`,
      label: isLabelAnchor ? `Group ${group}` : undefined,
      fill: COLORS[group % COLORS.length],
      size: isLabelAnchor ? 14 : undefined,
      data: {
        group,
        weight: isLabelAnchor ? 18 : 1 + ((index * 13) % 9)
      }
    };
  });

  const edges: GraphEdge[] = Array.from({ length: EDGE_COUNT }, (_, index) => {
    const source = index % NODE_COUNT;
    const sameGroupTarget =
      (source + GROUP_COUNT * (1 + ((index * 7) % 5))) % NODE_COUNT;
    const crossGroupTarget =
      (source + 1 + ((index * 97) % (NODE_COUNT - 1))) % NODE_COUNT;
    const target = index % 8 === 0 ? crossGroupTarget : sameGroupTarget;

    return {
      id: `e-${index}`,
      fill: index % 8 === 0 ? '#334155' : '#475569',
      size: index % 8 === 0 ? 1.8 : 2.2,
      source: `n-${source}`,
      target: `n-${target}`
    };
  });

  return { nodes, edges };
}

const areIdsEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((id, index) => id === b[index]);

const createConnectionMap = (edges: GraphEdge[]) => {
  const connections = new Map<
    string,
    {
      edgeIds: Set<string>;
      neighborIds: Set<string>;
    }
  >();

  const getConnections = (id: string) => {
    let nodeConnections = connections.get(id);

    if (!nodeConnections) {
      nodeConnections = {
        edgeIds: new Set(),
        neighborIds: new Set()
      };
      connections.set(id, nodeConnections);
    }

    return nodeConnections;
  };

  edges.forEach(edge => {
    const sourceConnections = getConnections(edge.source);
    const targetConnections = getConnections(edge.target);

    sourceConnections.edgeIds.add(edge.id);
    sourceConnections.neighborIds.add(edge.target);
    targetConnections.edgeIds.add(edge.id);
    targetConnections.neighborIds.add(edge.source);
  });

  const result = new Map<string, NodeConnections>();

  connections.forEach(({ edgeIds, neighborIds }, nodeId) => {
    result.set(nodeId, {
      edgeCount: edgeIds.size,
      ids: [nodeId, ...neighborIds, ...edgeIds],
      neighborCount: neighborIds.size
    });
  });

  return result;
};

const largeGraphLayout = {
  getNodePosition: (id: string, { nodes }: NodePositionArgs) => {
    const index = Number(id.replace('n-', ''));
    return getNodeLayoutPosition(index, nodes[index]?.data);
  }
} as LayoutFactoryProps;

const useStoryStats = (
  renderEngine: RenderEngine,
  graphRef: React.RefObject<
    (GraphCanvasRef & Partial<CosmosGraphCanvasRef>) | null
  >
) => {
  const [stats, setStats] = useState<StoryStats>({
    fps: 0,
    zoom: 1
  });

  useEffect(() => {
    let frameId = 0;
    let frames = 0;
    let fps = 0;
    let lastFpsUpdate = performance.now();
    let lastLabelUpdate = lastFpsUpdate;
    let lastStats: StoryStats = {
      fps,
      zoom: 1
    };

    const update = (now: number) => {
      frames += 1;

      const shouldUpdateFps = now - lastFpsUpdate >= 500;
      const shouldUpdateLabels =
        renderEngine === 'cosmos' && now - lastLabelUpdate >= 50;

      if (shouldUpdateFps || shouldUpdateLabels) {
        const cosmosGraph =
          renderEngine === 'cosmos'
            ? graphRef.current?.getCosmosGraph?.()
            : undefined;
        if (shouldUpdateFps) {
          fps = Math.round((frames * 1000) / (now - lastFpsUpdate));
        }

        const nextStats = {
          fps,
          zoom: cosmosGraph?.getZoomLevel() ?? 1
        };

        if (
          nextStats.fps !== lastStats.fps ||
          Math.abs(nextStats.zoom - lastStats.zoom) >= 0.01
        ) {
          lastStats = nextStats;
          setStats(nextStats);
        }

        if (shouldUpdateFps) {
          frames = 0;
          lastFpsUpdate = now;
        }

        if (shouldUpdateLabels) {
          lastLabelUpdate = now;
        }
      }

      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [graphRef, renderEngine]);

  return stats;
};

const GraphOverlay = ({
  edges,
  graphRef,
  interactionLabel,
  nodes,
  renderEngine,
  setRenderEngine
}: GraphOverlayProps) => {
  const stats = useStoryStats(renderEngine, graphRef);

  return (
    <>
      <div
        style={{
          alignItems: 'center',
          background: 'rgba(17, 24, 39, 0.88)',
          borderRadius: 4,
          color: '#f9fafb',
          display: 'flex',
          gap: 8,
          padding: 8,
          position: 'absolute',
          right: 15,
          top: 15,
          zIndex: 9
        }}
      >
        <button
          type="button"
          style={graphButtonStyle(renderEngine === 'three')}
          onClick={() => setRenderEngine('three')}
          disabled={renderEngine === 'three'}
        >
          Three.js
        </button>
        <button
          type="button"
          style={graphButtonStyle(renderEngine === 'cosmos')}
          onClick={() => setRenderEngine('cosmos')}
          disabled={renderEngine === 'cosmos'}
        >
          cosmos.gl
        </button>
        <span style={{ fontSize: 12 }}>
          {nodes.length.toLocaleString()} nodes /{' '}
          {edges.length.toLocaleString()} edges
        </span>
        <span style={{ fontSize: 12 }}>{stats.fps} FPS</span>
        {renderEngine === 'cosmos' && (
          <span style={{ fontSize: 12 }}>{stats.zoom.toFixed(2)}x zoom</span>
        )}
        <span style={{ fontSize: 12 }}>{interactionLabel}</span>
      </div>
    </>
  );
};

export const RendererSwitch = () => {
  const graphRef = useRef<
    (GraphCanvasRef & Partial<CosmosGraphCanvasRef>) | null
  >(null);
  const [renderEngine, setRenderEngine] = useState<RenderEngine>('cosmos');
  const [selectedIds, setSelectedIds] = useState<string[]>(EMPTY_IDS);
  const [activeId, setActiveId] = useState<string | undefined>();
  const [interactionLabel, setInteractionLabel] = useState('Ready');
  const { nodes, edges } = useMemo(createLargeGraph, []);
  const connectionMap = useMemo(() => createConnectionMap(edges), [edges]);
  const actives = useMemo(
    () => (activeId ? [activeId] : EMPTY_IDS),
    [activeId]
  );

  const updateInteraction = useCallback((label: string) => {
    setInteractionLabel(current => (current === label ? current : label));
  }, []);

  const clearActive = useCallback(() => {
    setActiveId(current => (current === undefined ? current : undefined));
  }, []);

  const handleCanvasClick = useCallback(() => {
    setSelectedIds(current => (current.length ? EMPTY_IDS : current));
    updateInteraction('Canvas');
  }, [updateInteraction]);

  const handleEdgeClick = useCallback(
    (edge: GraphEdge) => {
      const ids = [edge.source, edge.target, edge.id];
      setSelectedIds(current => (areIdsEqual(current, ids) ? current : ids));
      updateInteraction(`Edge ${edge.id}`);
    },
    [updateInteraction]
  );

  const handleEdgePointerOver = useCallback(
    (edge: GraphEdge) => {
      setActiveId(current => (current === edge.id ? current : edge.id));
      updateInteraction(`Edge ${edge.id}`);
    },
    [updateInteraction]
  );

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      const connections = connectionMap.get(node.id);
      const ids = connections?.ids ?? [node.id];

      setSelectedIds(current => (areIdsEqual(current, ids) ? current : ids));
      updateInteraction(
        connections
          ? `${node.label ?? node.id}: ${connections.edgeCount} edges, ${
              connections.neighborCount
            } neighbors`
          : (node.label ?? node.id)
      );
    },
    [connectionMap, updateInteraction]
  );

  const handleNodePointerOver = useCallback(
    (node: GraphNode) => {
      setActiveId(current => (current === node.id ? current : node.id));
      updateInteraction(node.label ?? node.id);
    },
    [updateInteraction]
  );

  return (
    <div style={{ inset: 0, overflow: 'hidden', position: 'absolute' }}>
      <GraphCanvas
        ref={graphRef}
        key={renderEngine}
        animated={false}
        cosmosConfig={COSMOS_CONFIG}
        defaultNodeSize={6}
        disabled={false}
        edgeArrowPosition="none"
        edges={edges}
        labelType="auto"
        layoutOverrides={largeGraphLayout}
        layoutType="custom"
        maxNodeSize={16}
        minNodeSize={3}
        nodes={nodes}
        actives={actives}
        onCanvasClick={handleCanvasClick}
        onEdgeClick={handleEdgeClick}
        onEdgePointerOut={clearActive}
        onEdgePointerOver={handleEdgePointerOver}
        onNodeClick={handleNodeClick}
        onNodePointerOut={clearActive}
        onNodePointerOver={handleNodePointerOver}
        renderEngine={renderEngine}
        selections={selectedIds}
        sizingAttribute="weight"
        sizingType="attribute"
      />
      <GraphOverlay
        edges={edges}
        graphRef={graphRef}
        interactionLabel={interactionLabel}
        nodes={nodes}
        renderEngine={renderEngine}
        setRenderEngine={setRenderEngine}
      />
    </div>
  );
};
