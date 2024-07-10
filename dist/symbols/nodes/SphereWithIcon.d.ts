import { FC } from 'react';
import { NodeRendererProps } from '../../types';
export interface SphereWithIconProps extends NodeRendererProps {
    /**
     * The image to display on the icon.
     */
    image: string;
}
export declare const SphereWithIcon: FC<SphereWithIconProps>;
