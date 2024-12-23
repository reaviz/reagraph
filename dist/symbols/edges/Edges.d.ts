import React, { FC } from 'react';
import { ContextMenuEvent, InternalGraphEdge } from '../../types';
import { EdgeArrowPosition } from '../Arrow';
import { EdgeLabelPosition, EdgeInterpolation } from '../Edge';
import { EdgeEvents } from './useEdgeEvents';
export type EdgesProps = {
    /**
     * Whether the edge should be animated.
     */
    animated?: boolean;
    /**
     * The placement of the edge arrow.
     */
    arrowPlacement?: EdgeArrowPosition;
    /**
     * A function that returns the context menu for the edge.
     */
    contextMenu?: (event: Partial<ContextMenuEvent>) => React.ReactNode;
    /**
     * Whether the edge should be disabled.
     */
    disabled?: boolean;
    /**
     * The array of edge objects.
     */
    edges: Array<InternalGraphEdge>;
    /**
     * The URL of the font for the edge label.
     */
    labelFontUrl?: string;
    /**
     * The placement of the edge label.
     */
    labelPlacement?: EdgeLabelPosition;
    /**
     * The type of interpolation used to draw the edge.
     */
    interpolation?: EdgeInterpolation;
} & EdgeEvents;
/**
 * Three.js rendering starts to get slower if you have an individual mesh for each edge
 * and a high number of edges.
 *
 * Instead, we take the edges and split them into their different render states:
 *
 *  * - Active (any edges that are marked as "selected" or "active" in the state)
 *  * - Dragging (any edges that are connected to a node that is being dragged)
 *  * - Intersecting (any edges that are currently intersected by the ray from the mouse position)
 *  * - Inactive (any edges that aren't active, dragging, or intersected)
 *
 * We generate the geometry for each edge in each of these groups, and then merge them
 * into a single geometry for each group. This merged mesh is rendered as one object
 * which gives much better performance. This means that we only need to update geometry
 * and positions when edges move between the different states, rather than updating all
 * edges whenever any other edge changes.
 *
 * To get this all working, we have to do a few things outside the @react-three/fiber world,
 * specifically:
 *
 *  * manually create edge/arrow geometries (see `useEdgeGeometry`)
 *  * manually track mouse/edge interactions and fire events (see `useEdgeEvents`)
 *  * manually update edge/arrow positions during aniamations (see `useEdgeAnimations`)
 */
export declare const Edges: FC<EdgesProps>;
