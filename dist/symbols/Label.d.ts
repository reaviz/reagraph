import { FC } from 'react';
import { ColorRepresentation, Euler } from 'three';
export interface LabelProps {
    /**
     * Text to render.
     */
    text: string;
    /**
     * Font URL.
     * Reference: https://github.com/reaviz/reagraph/issues/23
     */
    fontUrl?: string;
    /**
     * Size of the font.
     */
    fontSize?: number;
    /**
     * Color of the text.
     */
    color?: ColorRepresentation;
    /**
     * Stroke of the text.
     */
    stroke?: ColorRepresentation;
    /**
     * Opacity for the label.
     */
    opacity?: number;
    /**
     * The lenth of which to start the ellipsis.
     */
    ellipsis?: number;
    /**
     * Whether the label is active ( dragging, hover, focus ).
     */
    active?: boolean;
    /**
     * Rotation of the label.
     */
    rotation?: Euler | [number, number, number];
}
export declare const Label: FC<LabelProps>;
