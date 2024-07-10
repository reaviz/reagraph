import { FC } from 'react';
import { ClusterGroup } from '../utils';
import { ThreeEvent } from '@react-three/fiber';
export type ClusterEventArgs = Omit<ClusterGroup, 'position'>;
export interface ClusterProps extends ClusterGroup {
    /**
     * Whether the circle should be animated.
     */
    animated?: boolean;
    /**
     * The radius of the circle. Default 1.
     */
    radius?: number;
    /**
     * The padding of the circle. Default 20.
     */
    padding?: number;
    /**
     * The url for the label font.
     */
    labelFontUrl?: string;
    /**
     * Whether the node is disabled.
     */
    disabled?: boolean;
    /**
     * When the cluster was clicked.
     */
    onClick?: (cluster: ClusterEventArgs, event: ThreeEvent<MouseEvent>) => void;
    /**
     * When a cluster receives a pointer over event.
     */
    onPointerOver?: (cluster: ClusterEventArgs, event: ThreeEvent<PointerEvent>) => void;
    /**
     * When cluster receives a pointer leave event.
     */
    onPointerOut?: (cluster: ClusterEventArgs, event: ThreeEvent<PointerEvent>) => void;
}
export declare const Cluster: FC<ClusterProps>;
