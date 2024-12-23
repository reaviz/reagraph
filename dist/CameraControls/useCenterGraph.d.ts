import { InternalGraphNode } from '../types';
import { LayoutTypes } from 'layout/types';
export interface CenterNodesParams {
    animated?: boolean;
    centerOnlyIfNodesNotInView?: boolean;
}
export interface FitNodesParams {
    animated?: boolean;
    fitOnlyIfNodesNotInView?: boolean;
}
export interface CenterGraphInput {
    /**
     * Whether the animate the transition or not.
     */
    animated?: boolean;
    /**
     * Whether the center graph function is disabled or not.
     */
    disabled?: boolean;
    /**
     * The layout type of the graph used to determine rotation logic.
     */
    layoutType: LayoutTypes;
}
export interface CenterGraphOutput {
    /**
     * Centers the graph on a specific node or list of nodes.
     *
     * @param nodes - An array of `InternalGraphNode` objects to center the graph on. If this parameter is omitted,
     * the graph will be centered on all nodes.
     *
     * @param animated - A boolean flag that determines whether the centering action should be animated.
     *
     * @param centerOnlyIfNodesNotInView - A boolean flag that determines whether the graph should
     * only be centered if the nodes specified by `nodes` are not currently in view. If this
     * parameter is `true`, the graph will only be re-centered if one or more of the nodes
     * specified by `nodes` are not currently visible in the viewport. If this parameter is
     * `false` or omitted, the graph will be re-centered regardless of whether the nodes
     * are currently in view.
     */
    centerNodes: (nodes: InternalGraphNode[], opts: CenterNodesParams) => void;
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
    centerNodesById: (nodeIds: string[], opts?: CenterNodesParams) => void;
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
    fitNodesInViewById: (nodeIds: string[], opts?: FitNodesParams) => void;
    /**
     * Whether the graph is centered or not.
     */
    isCentered?: boolean;
}
export declare const useCenterGraph: ({ animated, disabled, layoutType }: CenterGraphInput) => CenterGraphOutput;
