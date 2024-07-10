import { BufferGeometry } from 'three';
import { InternalGraphEdge } from '../../types';
import { EdgeArrowPosition } from '../Arrow';
import { EdgeInterpolation } from '../Edge';
export type UseEdgeGeometry = {
    getGeometries(edges: Array<InternalGraphEdge>): Array<BufferGeometry>;
    getGeometry(active: Array<InternalGraphEdge>, inactive: Array<InternalGraphEdge>): BufferGeometry;
};
export declare function useEdgeGeometry(arrowPlacement: EdgeArrowPosition, interpolation: EdgeInterpolation): UseEdgeGeometry;
