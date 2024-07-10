import { FC } from 'react';
import { SvgProps } from './Svg';
import { ColorRepresentation } from 'three';
export interface SphereWithSvgProps extends SvgProps {
    /**
     * The image to display on the icon.
     */
    image: string;
    /**
     * The color of the svg fill.
     */
    svgFill?: ColorRepresentation;
}
export declare const SphereWithSvg: FC<SphereWithSvgProps>;
