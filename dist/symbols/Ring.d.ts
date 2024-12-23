import { FC } from 'react';
import { ColorRepresentation } from 'three';
export interface RingProps {
    /**
     * The color of the ring.
     */
    color?: ColorRepresentation;
    /**
     * Whether the ring should be animated.
     */
    animated?: boolean;
    /**
     * The size of the ring.
     */
    size?: number;
    /**
     * The opacity of the ring.
     */
    opacity?: number;
    /**
     * The stroke width of the ring.
     */
    strokeWidth?: number;
    /**
     * The inner radius of the ring.
     * Default value: 4
     */
    innerRadius?: number;
    /**
     * The number of segments in the ring geometry.
     * Default value: 25
     */
    segments?: number;
}
export declare const Ring: FC<RingProps>;
