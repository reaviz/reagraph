import { FC } from 'react';
import { NodeRendererProps } from '../../types';
import { SvgProps as DreiSvgProps } from 'glodrei';
export type SvgProps = NodeRendererProps & Omit<DreiSvgProps, 'src' | 'id'> & {
    /**
     * The image to display on the icon.
     */
    image: string;
};
export declare const Svg: FC<SvgProps>;
