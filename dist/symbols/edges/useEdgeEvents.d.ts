import { InternalGraphEdge } from '../../types';
export type EdgeEvents = {
    onClick?: (edge: InternalGraphEdge) => void;
    onContextMenu?: (edge?: InternalGraphEdge) => void;
    onPointerOver?: (edge: InternalGraphEdge) => void;
    onPointerOut?: (edge: InternalGraphEdge) => void;
};
export declare function useEdgeEvents(events: EdgeEvents, contextMenu: any, disabled: boolean): {
    handleClick: () => void;
    handleContextMenu: () => void;
    handleIntersections: (previous: Array<InternalGraphEdge>, intersected: Array<InternalGraphEdge>) => void;
};
