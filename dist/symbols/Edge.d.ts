import React, { FC } from 'react';
import { EdgeArrowPosition } from './Arrow';
import { ContextMenuEvent, InternalGraphEdge } from '../types';
import { ThreeEvent } from '@react-three/fiber';
/**
 * Label positions relatively edge.
 *
 * - below: show label under the edge line
 * - above: show label above the edge line
 * - inline: show label along the edge line
 * - natural: normal text positions
 */
export type EdgeLabelPosition = 'below' | 'above' | 'inline' | 'natural';
/**
 * Type of edge interpolation.
 *
 * - Linear is straight
 * - Curved is curved
 */
export type EdgeInterpolation = 'linear' | 'curved';
export interface EdgeProps {
    /**
     * The url for the label font.
     */
    labelFontUrl?: string;
    /**
     * The unique identifier of the edge.
     */
    id: string;
    /**
     * Whether the edge should be animated.
     */
    animated?: boolean;
    /**
     * Whether the edge should be disabled.
     */
    disabled?: boolean;
    /**
     * The placement of the edge label.
     */
    labelPlacement?: EdgeLabelPosition;
    /**
     * The placement of the edge arrow.
     */
    arrowPlacement?: EdgeArrowPosition;
    /**
     * The type of interpolation used to draw the edge.
     */
    interpolation: EdgeInterpolation;
    /**
     * A function that returns the context menu for the edge.
     */
    contextMenu?: (event: Partial<ContextMenuEvent>) => React.ReactNode;
    /**
     * A function that is called when the edge is clicked.
     */
    onClick?: (edge: InternalGraphEdge, event: ThreeEvent<MouseEvent>) => void;
    /**
     * A function that is called when the edge is right-clicked.
     */
    onContextMenu?: (edge?: InternalGraphEdge) => void;
    /**
     * A function that is called when the mouse pointer is moved over the edge.
     */
    onPointerOver?: (edge: InternalGraphEdge, event: ThreeEvent<PointerEvent>) => void;
    /**
     * A function that is called when the mouse pointer is moved out of the edge.
     */
    onPointerOut?: (edge: InternalGraphEdge, event: ThreeEvent<PointerEvent>) => void;
}
export declare const Edge: FC<EdgeProps>;
