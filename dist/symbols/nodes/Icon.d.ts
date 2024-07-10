import { FC } from 'react';
import { NodeRendererProps } from '../../types';
export interface IconProps extends NodeRendererProps {
    /**
     * The image to display on the icon.
     */
    image: string;
}
export declare const Icon: FC<IconProps>;
