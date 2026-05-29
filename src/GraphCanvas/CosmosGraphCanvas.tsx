import { Graph as CosmosGraph } from '@cosmos.gl/graph';
import type Graph from 'graphology';
import Graphology from 'graphology';
import type { Ref } from 'react';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react';

import { createElement } from '../selection/utils';
import { lightTheme } from '../themes';
import type { InternalGraphEdge, InternalGraphNode } from '../types';
import type { PreparedCosmosGraph } from './cosmos';
import {
  applyCosmosBuffers,
  buildCosmosBuffers,
  buildCosmosConfig,
  prepareCosmosGraph
} from './cosmos';
import {
  CosmosLabels,
  DEFAULT_COSMOS_LABEL_MAX_COUNT,
  DEFAULT_COSMOS_LABEL_UPDATE_INTERVAL
} from './CosmosLabels';
import type {
  CosmosGraphCanvasRef,
  CosmosGraphControls,
  GraphCanvasProps
} from './GraphCanvas';
import css from './GraphCanvas.module.css';

interface ResizableCosmosGraph {
  resizeCanvas?: (force?: boolean) => void;
}

const EMPTY_IDS: string[] = [];

const emptyPreparedGraph = (graph: Graph): PreparedCosmosGraph => ({
  graph,
  nodes: [],
  edges: [],
  nodeIndexById: new Map()
});

const resizeCosmosGraph = (graph: CosmosGraph) => {
  (graph as unknown as ResizableCosmosGraph).resizeCanvas?.(true);
};

export const CosmosGraphCanvas = forwardRef<
  CosmosGraphCanvasRef,
  GraphCanvasProps
>(
  (
    {
      layoutType = 'forceDirected2d',
      sizingType = 'default',
      labelType = 'auto',
      theme = lightTheme,
      animated = true,
      defaultNodeSize = 7,
      minNodeSize = 5,
      maxNodeSize = 15,
      edges,
      nodes,
      disabled,
      draggable,
      selections = EMPTY_IDS,
      actives = EMPTY_IDS,
      collapsedNodeIds = EMPTY_IDS,
      sizingAttribute,
      clusterAttribute,
      layoutOverrides,
      edgeInterpolation = 'linear',
      edgeArrowPosition = 'end',
      aggregateEdges,
      cosmosConfig,
      contextMenu,
      edgeLabelPosition,
      onCanvasClick,
      onLasso,
      onLassoEnd,
      onNodeContextMenu,
      onNodeClick,
      onNodeDoubleClick,
      onNodeDragged,
      onNodePointerOver,
      onNodePointerOut,
      onEdgeContextMenu,
      onEdgeClick,
      onEdgePointerOver,
      onEdgePointerOut,
      lassoType,
      renderNode,
      onRenderCluster,
      onClusterClick,
      onClusterDragged,
      onClusterPointerOver,
      onClusterPointerOut,
      children
    },
    ref: Ref<CosmosGraphCanvasRef>
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const cosmosRef = useRef<CosmosGraph | null>(null);
    const graphRef = useRef<Graph>(new Graphology({ multi: true }));
    const didFitViewRef = useRef(false);
    const preparedRef = useRef<PreparedCosmosGraph>(
      emptyPreparedGraph(graphRef.current)
    );
    const hoveredNodeIdRef = useRef<string | null>(null);
    const hoveredEdgeIdRef = useRef<string | null>(null);
    const lassoElementRef = useRef<HTMLDivElement | null>(null);
    const lassoStartRef = useRef<[number, number] | null>(null);
    const [preparedGraph, setPreparedGraph] = useState<PreparedCosmosGraph>(
      preparedRef.current
    );
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
    const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
    const [lassoActives, setLassoActives] = useState<string[]>([]);
    const selectedIds = useMemo(() => new Set(selections), [selections]);
    const activeIds = useMemo(() => {
      const ids = new Set([...actives, ...lassoActives]);
      if (hoveredNodeId) {
        ids.add(hoveredNodeId);
      }
      if (hoveredEdgeId) {
        ids.add(hoveredEdgeId);
      }

      return ids;
    }, [actives, hoveredEdgeId, hoveredNodeId, lassoActives]);
    const labelMaxCount =
      cosmosConfig?.labelMaxCount ?? DEFAULT_COSMOS_LABEL_MAX_COUNT;
    const labelUpdateInterval =
      cosmosConfig?.labelUpdateInterval ?? DEFAULT_COSMOS_LABEL_UPDATE_INTERVAL;

    const getNodeIndices = useCallback((nodeIds?: string[]) => {
      const prepared = preparedRef.current;

      if (!nodeIds?.length) {
        return prepared.nodes.map((_, index) => index);
      }

      return nodeIds.reduce<number[]>((indices, id) => {
        const index = prepared.nodeIndexById.get(id);
        if (index === undefined) {
          throw new Error(`Attempted to center ${id} but it was not found.`);
        }

        indices.push(index);
        return indices;
      }, []);
    }, []);

    const getNodeByIndex = useCallback(
      (index: number): InternalGraphNode | undefined =>
        preparedRef.current.nodes[index],
      []
    );

    const getEdgeByIndex = useCallback(
      (index: number): InternalGraphEdge | undefined =>
        preparedRef.current.edges[index],
      []
    );

    const getNodeContextProps = useCallback(
      (node: InternalGraphNode) => ({
        canCollapse: preparedRef.current.edges.some(
          edge => edge.source === node.id
        ),
        isCollapsed: collapsedNodeIds.includes(node.id)
      }),
      [collapsedNodeIds]
    );

    const centerGraph = useCallback(
      (nodeIds?: string[], opts?: { animated?: boolean }) => {
        const graph = cosmosRef.current;
        if (!graph) return;

        const duration = opts?.animated === false ? 0 : 250;
        const indices = getNodeIndices(nodeIds);

        if (
          !indices.length ||
          indices.length === preparedRef.current.nodes.length
        ) {
          graph.fitView(duration, 0.1);
        } else if (indices.length === 1) {
          graph.zoomToPointByIndex(indices[0], duration);
        } else {
          graph.fitViewByPointIndices(indices, duration, 0.1);
        }
      },
      [getNodeIndices]
    );

    const fitNodesInView = useCallback(
      (nodeIds?: string[], opts?: { animated?: boolean }) => {
        const graph = cosmosRef.current;
        if (!graph) return;

        graph.fitViewByPointIndices(
          getNodeIndices(nodeIds),
          opts?.animated === false ? 0 : 250,
          0.1
        );
      },
      [getNodeIndices]
    );

    const zoomIn = useCallback(() => {
      const graph = cosmosRef.current;
      graph?.zoom(graph.getZoomLevel() * 1.5, 250);
    }, []);

    const zoomOut = useCallback(() => {
      const graph = cosmosRef.current;
      graph?.zoom(graph.getZoomLevel() / 1.5, 250);
    }, []);

    const resetControls = useCallback(
      (animated?: boolean) =>
        cosmosRef.current?.fitView(animated === false ? 0 : 250, 0.1),
      []
    );

    const freeze = useCallback(() => cosmosRef.current?.pause(), []);
    const unFreeze = useCallback(() => cosmosRef.current?.unpause(), []);
    const getCosmosGraph = useCallback(
      () => cosmosRef.current ?? undefined,
      []
    );

    const getControls = useCallback(
      (): CosmosGraphControls => ({
        centerGraph,
        fitView: (duration?: number, padding?: number) =>
          cosmosRef.current?.fitView(duration, padding),
        fitNodesInView,
        freeze,
        getCosmosGraph,
        resetControls,
        unFreeze,
        zoomIn,
        zoomOut
      }),
      [
        centerGraph,
        fitNodesInView,
        freeze,
        getCosmosGraph,
        resetControls,
        unFreeze,
        zoomIn,
        zoomOut
      ]
    );

    useImperativeHandle(
      ref,
      () => ({
        centerGraph,
        fitNodesInView,
        zoomIn,
        zoomOut,
        resetControls,
        getGraph: () => preparedRef.current.graph,
        getControls,
        getCosmosGraph,
        exportCanvas: () => {
          cosmosRef.current?.render(0);
          return (
            containerRef.current?.querySelector('canvas')?.toDataURL() ?? ''
          );
        },
        freeze,
        unFreeze
      }),
      [
        centerGraph,
        fitNodesInView,
        freeze,
        getControls,
        getCosmosGraph,
        resetControls,
        unFreeze,
        zoomIn,
        zoomOut
      ]
    );

    const config = useMemo(
      () =>
        buildCosmosConfig({
          config: cosmosConfig,
          defaultNodeSize,
          disabled,
          draggable,
          edgeArrowPosition,
          edgeInterpolation,
          theme,
          onBackgroundClick: event => {
            if (!disabled) {
              onCanvasClick?.(event);
            }
          },
          onPointClick: (index, _position, event) => {
            if (disabled) return;

            const node = getNodeByIndex(index);
            if (!node) return;

            onNodeClick?.(node, getNodeContextProps(node), event as never);
          },
          onPointMouseOver: (index, _position, event) => {
            const node = getNodeByIndex(index);
            if (!node) return;

            hoveredNodeIdRef.current = node.id;
            setHoveredNodeId(node.id);
            onNodePointerOver?.(node, event as never);
          },
          onPointMouseOut: event => {
            const node = preparedRef.current.nodes.find(
              n => n.id === hoveredNodeIdRef.current
            );

            hoveredNodeIdRef.current = null;
            setHoveredNodeId(null);

            if (node) {
              onNodePointerOut?.(node, event as never);
            }
          },
          onLinkClick: (index, event) => {
            if (disabled) return;

            const edge = getEdgeByIndex(index);
            if (edge) {
              onEdgeClick?.(edge, event as never);
            }
          },
          onLinkMouseOver: index => {
            const edge = getEdgeByIndex(index);
            if (!edge) return;

            hoveredEdgeIdRef.current = edge.id;
            setHoveredEdgeId(edge.id);
            onEdgePointerOver?.(edge, undefined as never);
          },
          onLinkMouseOut: event => {
            const edge = preparedRef.current.edges.find(
              e => e.id === hoveredEdgeIdRef.current
            );

            hoveredEdgeIdRef.current = null;
            setHoveredEdgeId(null);

            if (edge) {
              onEdgePointerOut?.(edge, event as never);
            }
          },
          onPointDragEnd: event => {
            if (disabled || !onNodeDragged) return;

            const index = event.subject?.index;
            const node =
              typeof index === 'number' ? getNodeByIndex(index) : undefined;
            const graph = cosmosRef.current;

            if (!node || !graph) return;

            const positions = graph.getPointPositions();
            const offset = index * 2;
            const nextNode = {
              ...node,
              position: {
                ...node.position,
                x: positions[offset] ?? node.position.x,
                y: positions[offset + 1] ?? node.position.y
              }
            };

            preparedRef.current.nodes[index] = nextNode;
            setPreparedGraph(current =>
              current === preparedRef.current ? { ...current } : current
            );
            onNodeDragged(nextNode);
          }
        }),
      [
        cosmosConfig,
        defaultNodeSize,
        disabled,
        draggable,
        edgeArrowPosition,
        edgeInterpolation,
        getEdgeByIndex,
        getNodeContextProps,
        getNodeByIndex,
        onCanvasClick,
        onEdgeClick,
        onEdgePointerOut,
        onEdgePointerOver,
        onNodeClick,
        onNodeDragged,
        onNodePointerOut,
        onNodePointerOver,
        theme
      ]
    );

    useEffect(() => {
      if (!containerRef.current || cosmosRef.current) {
        return undefined;
      }

      const graph = new CosmosGraph(containerRef.current, config);
      cosmosRef.current = graph;

      return () => {
        graph.destroy();
        cosmosRef.current = null;
      };
      // Create the cosmos renderer once; config updates are applied below.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      const container = containerRef.current;
      if (!container || typeof ResizeObserver === 'undefined') {
        return undefined;
      }

      const observer = new ResizeObserver(() => {
        const graph = cosmosRef.current;
        if (!graph || !container.clientWidth || !container.clientHeight) {
          return;
        }

        resizeCosmosGraph(graph);
        graph.render(animated ? undefined : 0);

        if (!didFitViewRef.current && preparedRef.current.nodes.length) {
          graph.fitView(0, 0.1);
          didFitViewRef.current = true;
        }
      });

      observer.observe(container);

      return () => {
        observer.disconnect();
      };
    }, [animated]);

    useEffect(() => {
      cosmosRef.current?.setConfig(config);
    }, [config]);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) {
        return undefined;
      }

      const handleDoubleClick = (event: MouseEvent) => {
        if (disabled) return;

        const node = preparedRef.current.nodes.find(
          n => n.id === hoveredNodeIdRef.current
        );

        if (node) {
          onNodeDoubleClick?.(node, event as never);
        }
      };

      const handleContextMenu = (event: MouseEvent) => {
        if (disabled) return;

        const node = preparedRef.current.nodes.find(
          n => n.id === hoveredNodeIdRef.current
        );
        if (node && onNodeContextMenu) {
          event.preventDefault();
          onNodeContextMenu(node, {
            ...getNodeContextProps(node),
            onCollapse: () => undefined
          });
          return;
        }

        const edge = preparedRef.current.edges.find(
          e => e.id === hoveredEdgeIdRef.current
        );
        if (edge && onEdgeContextMenu) {
          event.preventDefault();
          onEdgeContextMenu(edge);
        }
      };

      container.addEventListener('dblclick', handleDoubleClick);
      container.addEventListener('contextmenu', handleContextMenu);

      return () => {
        container.removeEventListener('dblclick', handleDoubleClick);
        container.removeEventListener('contextmenu', handleContextMenu);
      };
    }, [
      disabled,
      getNodeContextProps,
      onEdgeContextMenu,
      onNodeContextMenu,
      onNodeDoubleClick
    ]);

    useEffect(() => {
      const container = containerRef.current;
      if (
        disabled ||
        !container ||
        !lassoType ||
        lassoType === 'none' ||
        lassoType === 'edge'
      ) {
        return undefined;
      }

      const getSelectionRect = (event: PointerEvent) => {
        const graph = cosmosRef.current;
        const start = lassoStartRef.current;
        if (!graph || !start) return undefined;

        const bounds = container.getBoundingClientRect();
        const current: [number, number] = [
          event.clientX - bounds.left,
          event.clientY - bounds.top
        ];
        const left = Math.max(0, Math.min(start[0], current[0]));
        const right = Math.min(bounds.width, Math.max(start[0], current[0]));
        const top = Math.max(0, Math.min(start[1], current[1]));
        const bottom = Math.min(bounds.height, Math.max(start[1], current[1]));

        return {
          graph,
          rect: [
            [left, top],
            [right, bottom]
          ] as [[number, number], [number, number]]
        };
      };

      const updateLassoElement = (event: PointerEvent) => {
        const start = lassoStartRef.current;
        const element = lassoElementRef.current;
        if (!start || !element) return;

        const bounds = container.getBoundingClientRect();
        const startClientX = bounds.left + start[0];
        const startClientY = bounds.top + start[1];
        const left = Math.min(startClientX, event.clientX);
        const right = Math.max(startClientX, event.clientX);
        const top = Math.min(startClientY, event.clientY);
        const bottom = Math.max(startClientY, event.clientY);

        element.style.left = `${left}px`;
        element.style.top = `${top}px`;
        element.style.width = `${right - left}px`;
        element.style.height = `${bottom - top}px`;
      };

      const selectNodesInRect = (event: PointerEvent) => {
        const selection = getSelectionRect(event);
        if (!selection) return [];

        return Array.from(selection.graph.getPointsInRect(selection.rect))
          .map(index => preparedRef.current.nodes[index]?.id)
          .filter((id): id is string => Boolean(id));
      };

      const handlePointerMove = (event: PointerEvent) => {
        if (!lassoStartRef.current) return;

        event.preventDefault();
        updateLassoElement(event);

        const selected = selectNodesInRect(event);
        setLassoActives(selected);
        onLasso?.(selected);
      };

      const handlePointerUp = (event: PointerEvent) => {
        if (!lassoStartRef.current) return;

        event.preventDefault();
        updateLassoElement(event);

        const selected = selectNodesInRect(event);
        setLassoActives(selected);
        onLassoEnd?.(selected);

        lassoStartRef.current = null;
        lassoElementRef.current?.parentElement?.removeChild(
          lassoElementRef.current
        );
        lassoElementRef.current = null;

        document.removeEventListener('pointermove', handlePointerMove, true);
        document.removeEventListener('pointerup', handlePointerUp, true);
      };

      const handlePointerDown = (event: PointerEvent) => {
        if (!event.shiftKey || event.button !== 0) return;

        event.preventDefault();
        event.stopImmediatePropagation();

        const bounds = container.getBoundingClientRect();
        lassoStartRef.current = [
          event.clientX - bounds.left,
          event.clientY - bounds.top
        ];

        const element = createElement(theme);
        lassoElementRef.current = element;
        container.appendChild(element);
        element.style.left = `${event.clientX}px`;
        element.style.top = `${event.clientY}px`;
        element.style.width = '0px';
        element.style.height = '0px';

        document.addEventListener('pointermove', handlePointerMove, true);
        document.addEventListener('pointerup', handlePointerUp, true);
      };

      container.addEventListener('pointerdown', handlePointerDown, true);

      return () => {
        container.removeEventListener('pointerdown', handlePointerDown, true);
        document.removeEventListener('pointermove', handlePointerMove, true);
        document.removeEventListener('pointerup', handlePointerUp, true);
        lassoElementRef.current?.parentElement?.removeChild(
          lassoElementRef.current
        );
        lassoElementRef.current = null;
        lassoStartRef.current = null;
      };
    }, [disabled, lassoType, onLasso, onLassoEnd, theme]);

    useEffect(() => {
      if (typeof console === 'undefined') {
        return;
      }

      const unsupportedProps = [
        children ? 'children' : undefined,
        contextMenu ? 'contextMenu' : undefined,
        edgeLabelPosition ? 'edgeLabelPosition' : undefined,
        lassoType === 'edge' ? 'lassoType="edge"' : undefined,
        renderNode ? 'renderNode' : undefined,
        onRenderCluster ? 'onRenderCluster' : undefined,
        onClusterClick ? 'onClusterClick' : undefined,
        onClusterDragged ? 'onClusterDragged' : undefined,
        onClusterPointerOver ? 'onClusterPointerOver' : undefined,
        onClusterPointerOut ? 'onClusterPointerOut' : undefined
      ].filter(Boolean);

      if (unsupportedProps.length) {
        console.warn(
          `GraphCanvas renderEngine="cosmos" does not currently support: ${unsupportedProps.join(
            ', '
          )}. These props are only handled by the Three.js renderer.`
        );
      }
    }, [
      children,
      contextMenu,
      edgeLabelPosition,
      lassoType,
      onClusterClick,
      onClusterDragged,
      onClusterPointerOut,
      onClusterPointerOver,
      onRenderCluster,
      renderNode
    ]);

    useEffect(() => {
      let cancelled = false;

      async function updateGraph() {
        const prepared = await prepareCosmosGraph({
          graph: graphRef.current,
          nodes,
          edges,
          aggregateEdges,
          collapsedNodeIds,
          clusterAttribute,
          defaultNodeSize,
          labelType,
          layoutOverrides,
          layoutType,
          maxNodeSize,
          minNodeSize,
          sizingAttribute,
          sizingType
        });

        if (!cancelled) {
          preparedRef.current = prepared;
          setPreparedGraph(prepared);
        }
      }

      updateGraph();

      return () => {
        cancelled = true;
      };
    }, [
      aggregateEdges,
      collapsedNodeIds,
      clusterAttribute,
      defaultNodeSize,
      edges,
      labelType,
      layoutOverrides,
      layoutType,
      maxNodeSize,
      minNodeSize,
      nodes,
      sizingAttribute,
      sizingType
    ]);

    useEffect(() => {
      const graph = cosmosRef.current;
      if (!graph) {
        return undefined;
      }

      const activeEdgeIds = new Set(actives);
      const colorActiveEdgeIds = new Set(actives);
      const activeNodeIds = new Set([...actives, ...lassoActives]);
      if (hoveredEdgeId) {
        colorActiveEdgeIds.add(hoveredEdgeId);
      }
      if (hoveredNodeId) {
        activeNodeIds.add(hoveredNodeId);
      }

      const buffers = buildCosmosBuffers({
        activeEdgeIds,
        activeNodeIds,
        colorActiveEdgeIds,
        defaultNodeSize,
        edgeArrowPosition,
        hasSelections: selections.length > 0,
        preparedGraph,
        selectedIds,
        theme
      });

      applyCosmosBuffers(graph, buffers, animated);

      const frameId = requestAnimationFrame(() => {
        if (cosmosRef.current !== graph) {
          return;
        }

        resizeCosmosGraph(graph);

        if (!didFitViewRef.current && preparedGraph.nodes.length) {
          graph.fitView(0, 0.1);
          didFitViewRef.current = true;
        }

        graph.render(animated ? undefined : 0);
      });

      return () => {
        cancelAnimationFrame(frameId);
      };
    }, [
      actives,
      animated,
      defaultNodeSize,
      edgeArrowPosition,
      hoveredEdgeId,
      hoveredNodeId,
      lassoActives,
      preparedGraph,
      selections,
      selectedIds,
      theme
    ]);

    return (
      <div className={css.canvas}>
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        <CosmosLabels
          activeIds={activeIds}
          containerRef={containerRef}
          defaultNodeSize={defaultNodeSize}
          graphRef={cosmosRef}
          labelType={labelType}
          maxCount={labelMaxCount}
          preparedGraph={preparedGraph}
          selectedIds={selectedIds}
          theme={theme}
          updateInterval={labelUpdateInterval}
        />
      </div>
    );
  }
);
