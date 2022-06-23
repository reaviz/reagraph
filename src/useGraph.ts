import { useRef, useState, useCallback, useEffect } from 'react';
import { SizingType } from './sizing';
import { LayoutTypes, layoutProvider, LayoutStrategy } from './layout';
import { LabelVisibilityType } from './utils/visibility';
import { tick } from './layout/layoutUtils';
import { GraphEdge, GraphNode } from './types';
import { buildGraph, transformGraph } from './utils/buildGraph';
import { useStore } from './store';

export interface GraphInputs {
  nodes: GraphNode[];
  edges: GraphEdge[];
  layoutType?: LayoutTypes;
  sizingType?: SizingType;
  labelType?: LabelVisibilityType;
  sizingAttribute?: string;
}

export const useGraph = ({
  layoutType,
  sizingType,
  labelType,
  sizingAttribute,
  nodes,
  edges
}: GraphInputs) => {
  const [graph, setEdges, setNodes] = useStore(state => [
    state.graph,
    state.setEdges,
    state.setNodes
  ]);

  const layoutMounted = useRef<boolean>(false);
  const layout = useRef<LayoutStrategy | null>(null);

  const updateLayout = useCallback(
    (curLayout?: any) => {
      layout.current =
        curLayout ||
        layoutProvider({
          type: layoutType,
          graph
        });

      tick(layout.current, () => {
        const result = transformGraph({
          graph,
          layout: layout.current,
          sizingType,
          labelType,
          sizingAttribute
        });

        setEdges(result.edges);
        setNodes(result.nodes);
      });
    },
    [
      layoutType,
      graph,
      sizingType,
      labelType,
      sizingAttribute,
      setEdges,
      setNodes
    ]
  );

  // Create the nggraph object
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
      updateLayout();
    }
  }, [graph, layoutType, updateLayout]);

  // Update layout on size, label changes
  useEffect(() => {
    if (layoutMounted.current) {
      updateLayout(layout.current);
    }
  }, [graph, sizingType, sizingAttribute, labelType, updateLayout]);
};
