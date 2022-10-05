import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { SizingType } from './sizing';
import {
  LayoutTypes,
  layoutProvider,
  LayoutStrategy,
  LayoutOverrides
} from './layout';
import { LabelVisibilityType } from './utils/visibility';
import { tick } from './layout/layoutUtils';
import { GraphEdge, GraphNode } from './types';
import { buildGraph, transformGraph } from './utils/buildGraph';
import { DragReferences, useStore } from './store';
import { getVisibleEntities } from './collapse';

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
  layoutOverrides?: LayoutOverrides;
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
  layoutOverrides
}: GraphInputs) => {
  const [
    graph,
    stateCollapsedNodeIds,
    setEdges,
    setNodes,
    setSelections,
    setActives,
    drags,
    setDrags,
    setCollapsedNodeIds
  ] = useStore(state => [
    state.graph,
    state.collapsedNodeIds,
    state.setEdges,
    state.setNodes,
    state.setSelections,
    state.setActives,
    state.drags,
    state.setDrags,
    state.setCollapsedNodeIds
  ]);

  const [mounted, setMounted] = useState<boolean>(false);
  const layoutMounted = useRef<boolean>(false);
  const layout = useRef<LayoutStrategy | null>(null);
  const { visibleEdges, visibleNodes } = useMemo(() => {
    const { visibleEdges, visibleNodes } = getVisibleEntities({
      collapsedIds: stateCollapsedNodeIds,
      nodes,
      edges
    });

    return {
      visibleEdges,
      visibleNodes
    };
  }, [stateCollapsedNodeIds, nodes, edges]);

  // Transient updates
  const dragRef = useRef<DragReferences>(drags);
  useEffect(() => {
    dragRef.current = drags;
  }, [drags]);

  const updateLayout = useCallback(
    (curLayout?: any) => {
      layout.current =
        curLayout ||
        layoutProvider({
          ...layoutOverrides,
          type: layoutType,
          graph,
          drags: dragRef.current,
          clusterAttribute
        });

      tick(layout.current, () => {
        const result = transformGraph({
          graph,
          layout: layout.current,
          sizingType,
          labelType,
          sizingAttribute,
          maxNodeSize,
          minNodeSize,
          defaultNodeSize
        });

        setEdges(result.edges);
        setNodes(result.nodes);
      });
    },
    [
      layoutOverrides,
      layoutType,
      graph,
      clusterAttribute,
      sizingType,
      labelType,
      sizingAttribute,
      maxNodeSize,
      minNodeSize,
      defaultNodeSize,
      setEdges,
      setNodes
    ]
  );

  useEffect(() => {
    // Let's set the store selections so its easier to access
    setSelections(selections);
  }, [selections, setSelections]);

  useEffect(() => {
    // Let's set the store actives so its easier to access
    setActives(actives);
  }, [actives, setActives]);

  // Create the nggraph graph object
  useEffect(() => {
    layoutMounted.current = false;
    buildGraph(graph, visibleNodes, visibleEdges);
    updateLayout();

    // queue this in a frame so it only happens after the graph is built
    requestAnimationFrame(() => {
      // Track mounted in state and transitent state
      layoutMounted.current = true;
      setMounted(true);
    });

    // eslint-disable-next-line
  }, [visibleNodes, visibleEdges, graph]);

  useEffect(() => {
    // Let's set the store collapsedNodeIds so its easier to access
    setCollapsedNodeIds(collapsedNodeIds);
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
  }, [graph, layoutType, updateLayout, setDrags]);

  // Update layout on size, label changes
  useEffect(() => {
    if (layoutMounted.current) {
      updateLayout(layout.current);
    }
  }, [graph, sizingType, sizingAttribute, labelType, updateLayout]);

  return {
    mounted
  };
};
