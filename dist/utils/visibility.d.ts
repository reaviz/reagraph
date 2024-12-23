import { PerspectiveCamera } from 'three';
import { EdgeLabelPosition } from '../symbols';
export type LabelVisibilityType = 'all' | 'auto' | 'none' | 'nodes' | 'edges';
interface CalcLabelVisibilityArgs {
    nodeCount: number;
    nodePosition?: {
        x: number;
        y: number;
        z: number;
    };
    labelType: LabelVisibilityType;
    camera?: PerspectiveCamera;
}
export declare function calcLabelVisibility({ nodeCount, nodePosition, labelType, camera }: CalcLabelVisibilityArgs): (shape: 'node' | 'edge', size: number) => boolean;
export declare function getLabelOffsetByType(offset: number, position: EdgeLabelPosition): number;
export {};
