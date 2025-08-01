import { InternalGraphNode } from 'types';

export type InstancedData = {
  nodeId: string;
  node: InternalGraphNode;
  isDragging: boolean;
  hasAnimated: boolean;
};

export interface InstancedMeshProps {
  nodes: InternalGraphNode[];
  actives?: string[];
  selections?: string[];
  animated?: boolean;
  draggable?: boolean;
  onNodeDrag?: (node: InternalGraphNode) => void;
  onPointerDown?: (event: any, instanceId: number) => void;
}
