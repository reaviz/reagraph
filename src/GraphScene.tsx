import React, {
  FC,
  forwardRef,
  Fragment,
  ReactNode,
  Ref,
  useCallback,
  useImperativeHandle,
  useMemo,
  useEffect
} from 'react';
import { useGraph } from './useGraph';
import { LayoutOverrides, LayoutTypes } from './layout';
import {
  NodeContextMenuProps,
  ContextMenuEvent,
  GraphEdge,
  GraphNode,
  InternalGraphEdge,
  InternalGraphNode,
  NodeRenderer,
  CollapseProps,
  ClusterRenderer
} from './types';
import type { SizingType } from './sizing';
import type { ClusterEventArgs } from './symbols/Cluster';
import type { EdgeArrowPosition } from './symbols/edges/Edge';
import type { EdgeInterpolation, EdgeLabelPosition } from './symbols/Edge';
import type {
  CenterNodesParams,
  FitNodesParams
} from './CameraControls/useCenterGraph';
import { Cluster } from './symbols/Cluster';
import { Edge } from './symbols/Edge';
import { Edges } from './symbols/edges';
import {
  InstancedIcon,
  InstancedSpheres,
  InstancedText,
  Node
} from './symbols';
import { useCenterGraph } from './CameraControls/useCenterGraph';
import { LabelVisibilityType } from './utils/visibility';
import { useStore } from './store';
import Graph from 'graphology';
import type { ThreeEvent } from '@react-three/fiber';
import { useThree } from '@react-three/fiber';
import { aggregateEdges as aggregateEdgesUtil } from './utils/aggregateEdges';
import { SpriteText } from 'symbols/nodes/SpriteText';
import {
  CulledText,
  InstancedSpriteText,
} from 'symbols/nodes/SpriteText2';
import { AdvancedCulledText } from 'symbols/nodes/CulledText';
import { InstancedMeshSphere } from 'symbols/instances/InstancedMeshSphere';
import { BatchedMeshSphere } from 'symbols/nodes/BatchedMesh';
import { InstancedNodes } from './symbols/instances/instancedNodes';

export interface GraphSceneProps {
  /**
   * Type of layout.
   */
  layoutType?: LayoutTypes;

  /**
   * List of ids that are selected.
   */
  selections?: string[];

  /**
   * List of ids that are active.
   */
  actives?: string[];

  /**
   * List of node ids that are collapsed.
   */
  collapsedNodeIds?: string[];

  /**
   * Animate or not the graph positions.
   */
  animated?: boolean;

  /**
   * Nodes to pass to the graph.
   */
  nodes: GraphNode[];

  /**
   * Edges to pass to the graph.
   */
  edges: GraphEdge[];

  /**
   * Context menu element.
   */
  contextMenu?: (event: ContextMenuEvent) => ReactNode;

  /**
   * Type of sizing for nodes.
   */
  sizingType?: SizingType;

  /**
   * Type of visibility for labels.
   */
  labelType?: LabelVisibilityType;

  /**
   * Place of visibility for edge labels.
   */
  edgeLabelPosition?: EdgeLabelPosition;

  /**
   * Placement of edge arrows.
   */
  edgeArrowPosition?: EdgeArrowPosition;

  /**
   * Shape of edge.
   */
  edgeInterpolation?: EdgeInterpolation;

  /**
   * Font of label, same as troika-three-text
   * The URL of a custom font file to be used. Supported font formats are: * .ttf * .otf * .woff (.woff2 is not supported)
   * Default: The Roboto font loaded from Google Fonts CDN
   */
  labelFontUrl?: string;

  /**
   * Attribute based sizing property.
   */
  sizingAttribute?: string;

  /**
   * The default size to size nodes to. Default is 7.
   */
  defaultNodeSize?: number;

  /**
   * When using sizing attributes, the min size a node can be.
   */
  minNodeSize?: number;

  /**
   * When using sizing attributes, the max size a node can be.
   */
  maxNodeSize?: number;

  /**
   * Attribute used for clustering.
   */
  clusterAttribute?: string;

  /**
   * Disable interactions or not.
   */
  disabled?: boolean;

  /**
   * Allow dragging of nodes.
   */
  draggable?: boolean;

  /**
   * Constrain dragging to the cluster bounds. Default is `false`.
   */
  constrainDragging?: boolean;

  /**
   * Use instanced rendering for nodes. Default is `false`.
   */
  useInstances?: boolean;

  /**
   * Render a custom node
   */
  renderNode?: NodeRenderer;

  /**
   * Render a custom cluster
   */
  onRenderCluster?: ClusterRenderer;

  /**
   * Advanced overrides for the layout.
   */
  layoutOverrides?: LayoutOverrides;

  /**
   * Whether to aggregate edges with the same source and target.
   */
  aggregateEdges?: boolean;

  /**
   * When a node was clicked.
   */
  onNodeClick?: (
    node: InternalGraphNode,
    props?: CollapseProps,
    event?: ThreeEvent<MouseEvent>
  ) => void;

  /**
   * When a node was double clicked.
   */
  onNodeDoubleClick?: (
    node: InternalGraphNode,
    event: ThreeEvent<MouseEvent>
  ) => void;

  /**
   * When a node context menu happened.
   */
  onNodeContextMenu?: (
    node: InternalGraphNode,
    props?: NodeContextMenuProps
  ) => void;

  /**
   * When node got a pointer over.
   */
  onNodePointerOver?: (
    node: InternalGraphNode,
    event: ThreeEvent<PointerEvent>
  ) => void;

  /**
   * When node lost pointer over.
   */
  onNodePointerOut?: (
    node: InternalGraphNode,
    event: ThreeEvent<PointerEvent>
  ) => void;

  /**
   * Triggered after a node was dragged.
   */
  onNodeDragged?: (node: InternalGraphNode) => void;

  /**
   * Triggered after a cluster was dragged.
   */
  onClusterDragged?: (cluster: ClusterEventArgs) => void;

  /**
   * When a edge context menu happened.
   */
  onEdgeContextMenu?: (edge?: InternalGraphEdge) => void;

  /**
   * When an edge was clicked.
   */
  onEdgeClick?: (
    edge: InternalGraphEdge,
    event?: ThreeEvent<MouseEvent>
  ) => void;

  /**
   * When edge got a pointer over.
   */
  onEdgePointerOver?: (
    edge: InternalGraphEdge,
    event?: ThreeEvent<PointerEvent>
  ) => void;

  /**
   * When edge lost pointer over.
   */
  onEdgePointerOut?: (
    edge: InternalGraphEdge,
    event?: ThreeEvent<PointerEvent>
  ) => void;

  /**
   * When a cluster was clicked.
   */
  onClusterClick?: (
    cluster: ClusterEventArgs,
    event: ThreeEvent<MouseEvent>
  ) => void;

  /**
   * When a cluster receives a pointer over event.
   */
  onClusterPointerOver?: (
    cluster: ClusterEventArgs,
    event: ThreeEvent<PointerEvent>
  ) => void;

  /**
   * When cluster receives a pointer leave event.
   */
  onClusterPointerOut?: (
    cluster: ClusterEventArgs,
    event: ThreeEvent<PointerEvent>
  ) => void;
}

export interface GraphSceneRef {
  /**
   * Reference to the graph object.
   */
  graph: Graph;

  /**
   * Centers the graph on a specific node or list of nodes.
   *
   * @param nodeIds - An array of node IDs to center the graph on. If this parameter is omitted,
   * the graph will be centered on all nodes.
   *
   * @param opts.centerOnlyIfNodesNotInView - A boolean flag that determines whether the graph should
   * only be centered if the nodes specified by `ids` are not currently in view. If this
   * parameter is `true`, the graph will only be re-centered if one or more of the nodes
   * specified by `ids` are not currently in view. If this parameter is
   * `false` or omitted, the graph will be re-centered regardless of whether the nodes
   * are currently in view.
   */
  centerGraph: (nodeIds?: string[], opts?: CenterNodesParams) => void;

  /**
   * Fit all the given nodes into view of the camera.
   *
   * @param nodeIds - An array of node IDs to fit the view on. If this parameter is omitted,
   * the view will fit to all nodes.
   *
   * @param opts.fitOnlyIfNodesNotInView - A boolean flag that determines whether the view should
   * only be fit if the nodes specified by `ids` are not currently in view. If this
   * parameter is `true`, the view will only be fit if one or more of the nodes
   * specified by `ids` are not currently visible in the viewport. If this parameter is
   * `false` or omitted, the view will be fit regardless of whether the nodes
   * are currently in view.
   */
  fitNodesInView: (nodeIds?: string[], opts?: FitNodesParams) => void;

  /**
   * Calls render scene on the graph. this is useful when you want to manually render the graph
   * for things like screenshots.
   */
  renderScene: () => void;
}

export const GraphScene: FC<GraphSceneProps & { ref?: Ref<GraphSceneRef> }> =
  forwardRef(
    (
      {
        onNodeClick,
        onNodeDoubleClick,
        onNodeContextMenu,
        onEdgeContextMenu,
        onEdgeClick,
        onEdgePointerOver,
        onEdgePointerOut,
        onNodePointerOver,
        onNodePointerOut,
        onClusterClick,
        onNodeDragged,
        onClusterDragged,
        onClusterPointerOver,
        onClusterPointerOut,
        contextMenu,
        animated,
        disabled,
        draggable,
        useInstances = false,
        constrainDragging = false,
        edgeLabelPosition,
        edgeArrowPosition,
        edgeInterpolation = 'linear',
        labelFontUrl,
        renderNode,
        onRenderCluster,
        aggregateEdges,
        ...rest
      },
      ref
    ) => {
      const { layoutType, clusterAttribute, labelType } = rest;

      // Get the gl/scene/camera for render shortcuts
      const gl = useThree(state => state.gl);
      const scene = useThree(state => state.scene);
      const camera = useThree(state => state.camera);

      // Mount and build the graph
      const { updateLayout } = useGraph({ ...rest, constrainDragging });

      if (
        clusterAttribute &&
        !(layoutType === 'forceDirected2d' || layoutType === 'forceDirected3d')
      ) {
        throw new Error(
          'Clustering is only supported for the force directed layouts.'
        );
      }

      // Get the graph and nodes via the store for memo
      const graph = useStore(state => state.graph);
      const nodes = useStore(state => state.nodes);
      const edgesStore = useStore(state => state.edges);
      const setEdges = useStore(state => state.setEdges);
      const clusters = useStore(state => [...state.clusters.values()]);
      const theme = useStore(state => state.theme);
      const actives = useStore(state => state.actives);

      // Process edges based on aggregation setting and update store
      const edges = useMemo(() => {
        if (aggregateEdges) {
          const aggregatedEdges = aggregateEdgesUtil(graph, labelType);
          return aggregatedEdges;
        } else {
          return edgesStore;
        }
      }, [edgesStore, aggregateEdges, graph, labelType]);

      // Update the store if edges were aggregated (moved to useEffect to avoid render cycle error)
      useEffect(() => {
        if (aggregateEdges && edgesStore.length !== edges.length) {
          setEdges(edges);
        }
      }, [edges, edgesStore.length, setEdges, aggregateEdges]);

      // Center the graph on the nodes
      const { centerNodesById, fitNodesInViewById, isCentered } =
        useCenterGraph({
          animated,
          disabled,
          layoutType
        });

      // Let's expose some helper methods
      useImperativeHandle(
        ref,
        () => ({
          centerGraph: centerNodesById,
          fitNodesInView: fitNodesInViewById,
          graph,
          renderScene: () => gl.render(scene, camera)
        }),
        [centerNodesById, fitNodesInViewById, graph, gl, scene, camera]
      );

      const onNodeDraggedHandler = useCallback(
        (node: InternalGraphNode) => {
          onNodeDragged?.(node);

          // Update layout to recalculate the cluster positions when a node is dragged
          if (clusterAttribute) {
            updateLayout();
          }
        },
        [clusterAttribute, onNodeDragged, updateLayout]
      );

      const nodeComponents = useMemo(() => {
        if (useInstances && !renderNode) {
          // Use InstancedSpheres for all nodes - it handles both regular spheres and icons
          return (
            <>
              <InstancedNodes
                nodes={nodes}
                selections={nodes.slice(0, 3).map(node => node.id)}
                actives={nodes.slice(0, 10).map(node => node.id)}
                animated={animated}
                draggable={draggable}
                onNodeDrag={onNodeDraggedHandler}
              />
              {/* <InstancedSpheres
                nodes={nodes}
                selections={rest.selections || []}
                actives={nodes.slice(0, 10).map(node => node.id)}
                animated={animated}
              /> */}
              {/* <InstancedMeshSphere
                nodes={nodes}
                selections={nodes.slice(0, 3).map(node => node.id)}
                actives={nodes.slice(0, 10).map(node => node.id)}
                animated={true}
                draggable={draggable}
                onNodeDrag={onNodeDraggedHandler}
              /> */}
              {/* <BatchedMeshSphere
                nodes={nodes}
                selections={nodes.slice(0, 3).map(node => node.id)}
                actives={nodes.slice(0, 10).map(node => node.id)}
                animated={true}
                draggable={draggable}
                onNodeDrag={onNodeDraggedHandler}
              /> */}
              {/* <InstancedText
                nodes={nodes}
                selections={rest.selections || []}
                actives={[]}
                animated={animated}
                fontSize={128}
              /> */}

              {/* <AdvancedCulledText
                nodes={nodes}
                selections={[]}
                actives={actives}
                fontSize={32}
                maxWidth={300}
              /> */}

              {/* <InstancedIcon
                nodes={nodes}
                selections={rest.selections || []}
                actives={[]}
                animated={animated}
              /> */}
            </>
          );
        }

        // Fallback to individual node rendering
        return nodes.map(n => (
          <Node
            key={n?.id}
            id={n?.id}
            labelFontUrl={labelFontUrl}
            draggable={draggable}
            constrainDragging={constrainDragging}
            disabled={disabled}
            animated={animated}
            contextMenu={contextMenu}
            renderNode={renderNode}
            onClick={onNodeClick}
            onDoubleClick={onNodeDoubleClick}
            onContextMenu={onNodeContextMenu}
            onPointerOver={onNodePointerOver}
            onPointerOut={onNodePointerOut}
            onDragged={onNodeDraggedHandler}
          />
        ));
      }, [
        constrainDragging,
        animated,
        contextMenu,
        disabled,
        draggable,
        labelFontUrl,
        theme,
        nodes,
        onNodeClick,
        onNodeContextMenu,
        onNodeDoubleClick,
        onNodeDraggedHandler,
        onNodePointerOut,
        onNodePointerOver,
        renderNode,
        rest.selections,
        rest.actives,
        useInstances,
      ]);

      const edgeComponents = useMemo(
        () =>
          animated ? (
            edges.map(e => (
              <Edge
                key={e.id}
                id={e.id}
                disabled={disabled}
                animated={animated}
                labelFontUrl={labelFontUrl}
                labelPlacement={edgeLabelPosition}
                arrowPlacement={edgeArrowPosition}
                interpolation={edgeInterpolation}
                contextMenu={contextMenu}
                onClick={onEdgeClick}
                onContextMenu={onEdgeContextMenu}
                onPointerOver={onEdgePointerOver}
                onPointerOut={onEdgePointerOut}
              />
            ))
          ) : (
            <Edges
              edges={edges}
              disabled={disabled}
              animated={animated}
              labelFontUrl={labelFontUrl}
              labelPlacement={edgeLabelPosition}
              arrowPlacement={edgeArrowPosition}
              interpolation={edgeInterpolation}
              contextMenu={contextMenu}
              onClick={onEdgeClick}
              onContextMenu={onEdgeContextMenu}
              onPointerOver={onEdgePointerOver}
              onPointerOut={onEdgePointerOut}
            />
          ),
        [
          animated,
          contextMenu,
          disabled,
          edgeArrowPosition,
          edgeInterpolation,
          edgeLabelPosition,
          edges,
          labelFontUrl,
          onEdgeClick,
          onEdgeContextMenu,
          onEdgePointerOut,
          onEdgePointerOver
        ]
      );

      const clusterComponents = useMemo(
        () =>
          clusters.map(c => (
            <Cluster
              key={c.label}
              animated={animated}
              disabled={disabled}
              draggable={draggable}
              labelFontUrl={labelFontUrl}
              onClick={onClusterClick}
              onPointerOver={onClusterPointerOver}
              onPointerOut={onClusterPointerOut}
              onDragged={onClusterDragged}
              onRender={onRenderCluster}
              {...c}
            />
          )),
        [
          animated,
          clusters,
          disabled,
          draggable,
          labelFontUrl,
          onClusterClick,
          onClusterPointerOut,
          onClusterPointerOver,
          onClusterDragged,
          onRenderCluster
        ]
      );

      return (
        isCentered && (
          <Fragment>
            {edgeComponents}
            {nodeComponents}
            {clusterComponents}
          </Fragment>
        )
      );
    }
  );
