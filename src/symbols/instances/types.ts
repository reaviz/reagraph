import { ThreeEvent } from '@react-three/fiber';
import { InstancedEntity } from '@three.ez/instanced-mesh';
import { InternalGraphNode } from 'types';

export type InstancedData = {
  nodeId: string;
  node: InternalGraphNode;
  isDragging: boolean;
  hasAnimated: boolean;
};

export type Instance = InstancedEntity & InstancedData;

export interface InstancedMeshProps {
  nodes: InternalGraphNode[];
  actives?: string[];
  selections?: string[];
  animated?: boolean;
  draggable?: boolean;
  disabled?: boolean;
  onNodeDrag?: (node: InternalGraphNode) => void;
  onPointerDown?: (event: ThreeEvent<MouseEvent>, instance: Instance) => void;
  onClick?: (event: ThreeEvent<MouseEvent>, instance: Instance) => void;
}
