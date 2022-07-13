import { useRef, useState, useCallback, useEffect } from 'react';
import { SizingType } from './sizing';
import { LayoutTypes, layoutProvider, LayoutStrategy } from './layout';
import { LabelVisibilityType } from './utils/visibility';
import { tick } from './layout/layoutUtils';
import { GraphEdge, GraphNode, InternalGraphNode } from './types';
import { buildGraph, transformGraph } from './utils/buildGraph';
import { DragReferences, useStore } from './store';

export interface GraphInputs {
  nodes: GraphNode[];
  edges: GraphEdge[];
  layoutType?: LayoutTypes;
  sizingType?: SizingType;
  labelType?: LabelVisibilityType;
  sizingAttribute?: string;
  selections?: string[];
  clusterAttribute?: string;
  defaultNodeSize?: number;
  minNodeSize?: number;
  maxNodeSize?: number;
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
  defaultNodeSize,
  maxNodeSize,
  minNodeSize
}: GraphInputs) => {
  const [graph, setEdges, setNodes, setSelections, drags, setDrags] = useStore(
    state => [
      state.graph,
      state.setEdges,
      state.setNodes,
      state.setSelections,
      state.drags,
      state.setDrags
    ]
  );

  const layoutMounted = useRef<boolean>(false);
  const layout = useRef<LayoutStrategy | null>(null);

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
      maxNodeSize,
      minNodeSize,
      layoutType,
      graph,
      sizingType,
      clusterAttribute,
      labelType,
      sizingAttribute,
      setEdges,
      setNodes
    ]
  );

  useEffect(() => {
    // Let's set the store selections so its easier to access
    setSelections(selections);
  }, [selections, setSelections]);

  // Create the nggraph graph object
  useEffect(() => {
    buildGraph(graph, nodes, edges);
    updateLayout();

    // queue this in a frame so it only happens after the graph is built
    requestAnimationFrame(() => (layoutMounted.current = true));

    // eslint-disable-next-line
  }, [nodes, edges, graph]);

  // Update layout on type changes
  useEffect(() => {
    if (layoutMounted.current) {
      // Set the transient and the state
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
};
