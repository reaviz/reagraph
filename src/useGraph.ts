import { useRef, useState, useCallback, useEffect } from 'react';
import { SizingType } from './sizing';
import { LayoutTypes, layoutProvider, LayoutStrategy } from './layout';
import ngraph from 'ngraph.graph';
import { LabelVisibilityType } from './utils/visibility';
import { tick } from './layout/layoutUtils';
import {
  GraphEdge,
  GraphNode,
  InternalGraphEdge,
  InternalGraphNode
} from './types';
import { buildGraph, transformGraph } from './utils/buildGraph';

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
  const graph = useRef<any>(ngraph());
  const layoutMounted = useRef<boolean>(false);
  const layout = useRef<LayoutStrategy | null>(null);
  const [internalNodes, setInternalNodes] = useState<InternalGraphNode[]>([]);
  const [internalEdges, setInternalEdges] = useState<InternalGraphEdge[]>([]);

  const updateLayout = useCallback(
    (curLayout?: any) => {
      layout.current =
        curLayout ||
        layoutProvider({
          type: layoutType,
          graph: graph.current
        });

      tick(layout.current, () => {
        const result = transformGraph({
          graph: graph.current,
          layout: layout.current,
          sizingType,
          labelType,
          sizingAttribute
        });

        setInternalEdges(result.edges);
        setInternalNodes(result.nodes);
      });
    },
    [graph, layoutType, sizingType, sizingAttribute, labelType]
  );

  // Create the nggraph object
  useEffect(() => {
    buildGraph(graph.current, nodes, edges);
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

  return {
    graph: graph.current,
    nodes: internalNodes,
    edges: internalEdges
  };
};
