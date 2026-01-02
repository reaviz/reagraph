import { useThree } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { PerspectiveCamera } from 'three';

import { getVisibleEntities } from './collapse';
import type { LayoutOverrides, LayoutStrategy, LayoutTypes } from './layout';
import {
  layoutProvider,
  useForceAtlas2Worker,
  supportsFA2Worker,
  createGraphPositionAdapter,
  createPositionMapAdapter
} from './layout';
import { tick } from './layout/layoutUtils';
import type { SizingType } from './sizing';
import type { DragReferences } from './store';
import { useStore } from './store';
import type { GraphEdge, GraphNode, InternalGraphNode, InternalVector3 } from './types';
import { calculateClusters } from './utils/cluster';
import { buildGraph, transformGraph } from './utils/graph';
import type { LabelVisibilityType } from './utils/visibility';
import { calcLabelVisibility } from './utils/visibility';
import { useLayoutWorker, supportsWebWorkers } from './workers';

export interface GraphInputs {
  nodes: GraphNode[];
  edges: GraphEdge[];
  collapsedNodeIds?: string[];
  layoutType?: LayoutTypes;
  sizingType?: SizingType;
  labelType?: LabelVisibilityType;
  sizingAttribute?: string;
  selections?: string[];
  actives?: string[];
  clusterAttribute?: string;
  defaultNodeSize?: number;
  minNodeSize?: number;
  maxNodeSize?: number;
  constrainDragging?: boolean;
  layoutOverrides?: LayoutOverrides;
  /**
   * Enable web workers for layout calculations.
   * This moves heavy layout computations off the main thread,
   * improving UI responsiveness especially for large graphs.
   * Default: false
   */
  webWorkers?: boolean;
}

export const useGraph = ({
  layoutType,
  sizingType,
  labelType,
  sizingAttribute,
  clusterAttribute,
  selections,
  nodes,
  edges,
  actives,
  collapsedNodeIds,
  defaultNodeSize,
  maxNodeSize,
  minNodeSize,
  layoutOverrides,
  constrainDragging,
  webWorkers = false
}: GraphInputs) => {
  const graph = useStore(state => state.graph);
  const clusters = useStore(state => state.clusters);
  const storedNodes = useStore(state => state.nodes);
  const setClusters = useStore(state => state.setClusters);
  const stateCollapsedNodeIds = useStore(state => state.collapsedNodeIds);
  const setEdges = useStore(state => state.setEdges);
  const stateNodes = useStore(state => state.nodes);
  const setNodes = useStore(state => state.setNodes);
  const setSelections = useStore(state => state.setSelections);
  const setActives = useStore(state => state.setActives);
  const drags = useStore(state => state.drags);
  const setDrags = useStore(state => state.setDrags);
  const setCollapsedNodeIds = useStore(state => state.setCollapsedNodeIds);
  const layoutMounted = useRef<boolean>(false);
  const layout = useRef<LayoutStrategy | null>(null);
  const camera = useThree(state => state.camera) as PerspectiveCamera;
  const dragRef = useRef<DragReferences>(drags);
  const clustersRef = useRef<any>([]);

  // Worker layout support
  const workerEnabled = webWorkers && supportsWebWorkers();
  const { calculateLayout: workerCalculateLayout } = useLayoutWorker();

  // ForceAtlas2 worker (uses graphology's native worker implementation)
  const fa2WorkerEnabled = webWorkers && supportsFA2Worker() && layoutType === 'forceatlas2';
  const { runLayout: runFA2Layout } = useForceAtlas2Worker();

  // When a new node is added, remove the dragged position of the cluster nodes to put new node in the right place
  useEffect(() => {
    if (!clusterAttribute) {
      return;
    }

    const existedNodesIds = storedNodes.map(n => n.id);
    const newNode = nodes.find(n => !existedNodesIds.includes(n.id));
    if (newNode) {
      const clusterName = newNode.data[clusterAttribute];
      const cluster = clusters.get(clusterName);
      const drags = { ...dragRef.current };

      cluster?.nodes?.forEach(node => (drags[node.id] = undefined));

      dragRef.current = drags;
      setDrags(drags);
    }
  }, [storedNodes, nodes, clusterAttribute, clusters, setDrags]);

  // Calculate the visible entities
  const { visibleEdges, visibleNodes } = useMemo(
    () =>
      getVisibleEntities({
        collapsedIds: stateCollapsedNodeIds,
        nodes,
        edges
      }),
    [stateCollapsedNodeIds, nodes, edges]
  );

  // Store node positions inside drags state
  const updateDrags = useCallback(
    (nodes: InternalGraphNode[]) => {
      const drags = { ...dragRef.current };
      nodes.forEach(node => (drags[node.id] = node));
      dragRef.current = drags;
      setDrags(drags);
    },
    [setDrags]
  );

  const updateLayout = useCallback(
    async (curLayout?: any) => {
      // Use graphology's ForceAtlas2 worker if available and layout type matches
      if (fa2WorkerEnabled && !curLayout) {
        try {
          // Extract FA2 settings from layoutOverrides
          const fa2Options: any = {};
          if (layoutOverrides) {
            const overridesAny = layoutOverrides as any;
            const fa2Keys = [
              'adjustSizes', 'barnesHutOptimize', 'barnesHutTheta',
              'edgeWeightInfluence', 'gravity', 'linLogMode',
              'outboundAttractionDistribution', 'scalingRatio', 'slowDown',
              'strongGravityMode', 'iterations'
            ];
            fa2Keys.forEach(key => {
              if (overridesAny[key] !== undefined) {
                fa2Options[key] = overridesAny[key];
              }
            });
          }

          // Run ForceAtlas2 in web worker (updates graph node attributes directly)
          await runFA2Layout(graph, fa2Options);

          // Create layout adapter that reads positions from graph attributes
          // FA2 worker stores x/y directly on node attributes
          const workerLayout = createGraphPositionAdapter({
            graph,
            drags: dragRef.current,
            is3d: false // FA2 is 2D only
          });

          // Transform the graph using the adapter
          const result = transformGraph({
            graph,
            layout: workerLayout,
            sizingType,
            labelType,
            sizingAttribute,
            maxNodeSize,
            minNodeSize,
            defaultNodeSize,
            clusterAttribute
          });

          // Calculate clusters
          const newClusters = calculateClusters({
            nodes: result.nodes,
            clusterAttribute
          });

          // Handle constrained dragging
          if (constrainDragging) {
            newClusters.forEach(cluster => {
              const prevCluster = clustersRef.current.get(cluster.label);
              if (prevCluster?.nodes.length === cluster.nodes.length) {
                cluster.position =
                  clustersRef.current?.get(cluster.label)?.position ??
                  cluster.position;
              }
            });
          }

          // Set our store outputs
          setEdges(result.edges);
          setNodes(result.nodes);
          setClusters(newClusters);
          if (clusterAttribute) {
            updateDrags(result.nodes);
          }
          return;
        } catch (error) {
          console.warn('ForceAtlas2 worker failed, falling back to main thread:', error);
          // Fall through to main-thread layout
        }
      }

      // Use custom worker-based layout for other layout types if enabled
      if (workerEnabled && !fa2WorkerEnabled && !curLayout) {
        try {
          // Get visible nodes and edges for worker
          const graphNodes = graph.nodes().map(id => ({
            ...graph.getNodeAttributes(id),
            id
          }));
          const graphEdges: GraphEdge[] = [];
          graph.forEachEdge((_id, attrs, source, target) => {
            graphEdges.push({ ...attrs, id: _id, source, target });
          });

          // Calculate layout in worker
          // Extract only number values from layoutOverrides (worker doesn't support functions)
          const workerOptions: any = {
            layoutType,
            clusterAttribute,
            drags: dragRef.current,
            clusters: clustersRef?.current
          };

          // Copy numeric overrides (filter out functions)
          if (layoutOverrides) {
            const overridesAny = layoutOverrides as any;
            const numericKeys = [
              'nodeStrength', 'linkDistance', 'clusterStrength',
              'nodeLevelRatio', 'forceLinkDistance', 'forceLinkStrength', 'forceCharge'
            ];
            numericKeys.forEach(key => {
              const value = overridesAny[key];
              if (typeof value === 'number') {
                workerOptions[key] = value;
              }
            });
            if (overridesAny.clusterType) {
              workerOptions.clusterType = overridesAny.clusterType;
            }
            if (overridesAny.mode) {
              workerOptions.mode = overridesAny.mode;
            }
          }

          const workerResult = await workerCalculateLayout(
            graphNodes,
            graphEdges,
            workerOptions
          );

          // Create layout adapter from worker-computed positions
          const is3d = layoutType?.includes('3d') ?? false;
          const workerLayout = createPositionMapAdapter(
            workerResult.positions,
            dragRef.current,
            is3d
          );

          // Transform the graph using the adapter
          const result = transformGraph({
            graph,
            layout: workerLayout,
            sizingType,
            labelType,
            sizingAttribute,
            maxNodeSize,
            minNodeSize,
            defaultNodeSize,
            clusterAttribute
          });

          // Calculate clusters
          const newClusters = calculateClusters({
            nodes: result.nodes,
            clusterAttribute
          });

          // Handle constrained dragging
          if (constrainDragging) {
            newClusters.forEach(cluster => {
              const prevCluster = clustersRef.current.get(cluster.label);
              if (prevCluster?.nodes.length === cluster.nodes.length) {
                cluster.position =
                  clustersRef.current?.get(cluster.label)?.position ??
                  cluster.position;
              }
            });
          }

          // Set our store outputs
          setEdges(result.edges);
          setNodes(result.nodes);
          setClusters(newClusters);
          if (clusterAttribute) {
            updateDrags(result.nodes);
          }
          return;
        } catch (error) {
          console.warn('Worker layout failed, falling back to main thread:', error);
          // Fall through to main-thread layout
        }
      }

      // Main-thread layout (fallback or when worker not enabled)
      // Cache the layout provider
      layout.current =
        curLayout ||
        layoutProvider({
          ...layoutOverrides,
          type: layoutType,
          graph,
          drags: dragRef.current,
          clusters: clustersRef?.current,
          clusterAttribute
        });

      // Run the layout
      await tick(layout.current);

      // Transform the graph
      const result = transformGraph({
        graph,
        layout: layout.current,
        sizingType,
        labelType,
        sizingAttribute,
        maxNodeSize,
        minNodeSize,
        defaultNodeSize,
        clusterAttribute
      });

      // Calculate clusters
      const newClusters = calculateClusters({
        nodes: result.nodes,
        clusterAttribute
      });

      // Do not decrease the cluster size is the number of nodes is the same
      if (constrainDragging) {
        newClusters.forEach(cluster => {
          const prevCluster = clustersRef.current.get(cluster.label);
          if (prevCluster?.nodes.length === cluster.nodes.length) {
            cluster.position =
              clustersRef.current?.get(cluster.label)?.position ??
              cluster.position;
          }
        });
      }

      // Set our store outputs
      setEdges(result.edges);
      setNodes(result.nodes);
      setClusters(newClusters);
      if (clusterAttribute) {
        // Set drag positions for nodes to prevent them from being moved by the layout update
        updateDrags(result.nodes);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      fa2WorkerEnabled,
      runFA2Layout,
      workerEnabled,
      workerCalculateLayout,
      layoutOverrides,
      layoutType,
      clusterAttribute,
      sizingType,
      labelType,
      sizingAttribute,
      maxNodeSize,
      minNodeSize,
      defaultNodeSize,
      setEdges,
      setNodes,
      setClusters,
      constrainDragging
    ]
  );

  // Transient updates
  useEffect(() => {
    dragRef.current = drags;
  }, [drags, clusterAttribute, updateLayout]);

  // Transient cluster state
  useEffect(() => {
    clustersRef.current = clusters;
  }, [clusters]);

  useEffect(() => {
    // When the camera position/zoom changes, update the label visibility
    const nodes = stateNodes.map(node => ({
      ...node,
      labelVisible: calcLabelVisibility({
        nodeCount: stateNodes?.length,
        labelType,
        camera,
        nodePosition: node?.position
      })('node', node?.size)
    }));

    // Determine if the label visibility has changed
    const isVisibilityUpdated = nodes.some(
      (node, i) => node.labelVisible !== stateNodes[i].labelVisible
    );

    // Update the nodes if the label visibility has changed
    if (isVisibilityUpdated) {
      setNodes(nodes);
    }
  }, [camera, camera.zoom, camera.position.z, setNodes, stateNodes, labelType]);

  useEffect(() => {
    // Let's set the store selections so its easier to access
    if (layoutMounted.current) {
      setSelections(selections);
    }
  }, [selections, setSelections]);

  useEffect(() => {
    // Let's set the store actives so its easier to access
    if (layoutMounted.current) {
      setActives(actives);
    }
  }, [actives, setActives]);

  // Create the nggraph graph object
  useEffect(() => {
    async function update() {
      layoutMounted.current = false;
      buildGraph(graph, visibleNodes, visibleEdges);
      await updateLayout();
      // rqf to prevent race condition
      requestAnimationFrame(() => (layoutMounted.current = true));
    }

    update();
    // eslint-disable-next-line
  }, [visibleNodes, visibleEdges]);

  useEffect(() => {
    // Let's set the store collapsedNodeIds so its easier to access
    if (layoutMounted.current) {
      setCollapsedNodeIds(collapsedNodeIds);
    }
  }, [collapsedNodeIds, setCollapsedNodeIds]);

  // Update layout on type changes
  useEffect(() => {
    if (layoutMounted.current) {
      // When a update is changed, discard all the previous drag positions
      // NOTE: This sets the transient and the state
      dragRef.current = {};
      setDrags({});

      // Recalculate the layout
      updateLayout();
    }
  }, [layoutType, updateLayout, setDrags]);

  // Update layout on size, label changes
  useEffect(() => {
    if (layoutMounted.current) {
      updateLayout(layout.current);
    }
  }, [sizingType, sizingAttribute, labelType, updateLayout]);

  return {
    updateLayout
  };
};
