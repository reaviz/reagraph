import React, { FC } from 'react';
import { ColorRepresentation } from 'three';
import { ContextMenuEvent, InternalGraphEdge } from '../../types';
/**
 * Label positions relatively edge
 *
 * below: show label under the edge line
 * above: show label above the edge line
 * inline: show label along the edge line
 * natural: normal text positions
 */
export type EdgeLabelPosition = 'below' | 'above' | 'inline' | 'natural';
export type EdgeArrowPosition = 'none' | 'mid' | 'end';
export interface EdgeProps {
    /**
     * Whether the edge should be animated.
     */
    animated?: boolean;
    /**
     * Whether the edge should be disabled.
     */
    disabled?: boolean;
    /**
     * The color of the edge.
     */
    color: ColorRepresentation;
    /**
     * A function that returns the context menu for the edge.
     */
    contextMenu?: (event: Partial<ContextMenuEvent>) => React.ReactNode;
    /**
     * The edge object.
     */
    edge: InternalGraphEdge;
    /**
     * The URL of the font for the edge label.
     */
    labelFontUrl?: string;
    /**
     * The placement of the edge label.
     */
    labelPlacement?: EdgeLabelPosition;
    /**
     * The opacity of the edge.
     */
    opacity?: number;
}
export declare const Edge: FC<EdgeProps>;
