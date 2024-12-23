import { InternalGraphEdge, InternalGraphNode } from 'types';
export type DagMode = 'lr' | 'rl' | 'td' | 'but' | 'zout' | 'zin' | 'radialin' | 'radialout';
export interface ForceRadialInputs {
    nodes: InternalGraphNode[];
    edges: InternalGraphEdge[];
    mode: DagMode;
    nodeLevelRatio: number;
}
/**
 * Radial graph layout using D3 Force 3d.
 * Inspired by: https://github.com/vasturiano/three-forcegraph/blob/master/src/forcegraph-kapsule.js#L970-L1018
 */
export declare function forceRadial({ nodes, edges, mode, nodeLevelRatio }: ForceRadialInputs): any;
