import { FC } from 'react';
import { Color } from 'three';
import { Theme } from '../../themes';
export interface RingProps {
    outerRadius: number;
    innerRadius: number;
    padding: number;
    normalizedFill: Color;
    normalizedStroke: Color;
    opacity: number;
    animated: boolean;
    theme: Theme;
}
export declare const Ring: FC<RingProps>;
