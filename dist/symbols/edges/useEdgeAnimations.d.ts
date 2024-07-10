import { SpringValue } from '@react-spring/three';
import { BufferGeometry } from 'three';
import { Theme } from '../../themes';
export declare function useEdgePositionAnimation(geometry: BufferGeometry, animated: boolean): void;
export type UseEdgeOpacityAnimations = {
    activeOpacity: SpringValue<number>;
    inactiveOpacity: SpringValue<number>;
};
export declare function useEdgeOpacityAnimation(animated: boolean, hasSelections: boolean, theme: Theme): UseEdgeOpacityAnimations;
