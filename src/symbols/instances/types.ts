import { ThreeEvent } from '@react-three/fiber';
import { InstancedEntity } from '@three.ez/instanced-mesh';
import { Theme } from '../../themes/theme';
import { InternalGraphNode } from 'types';

export type InstancedData = {
  nodeId: string;
  node: InternalGraphNode;
  isDragging: boolean;
  hasAnimated: boolean;
};

export type Instance = InstancedEntity & InstancedData;

export interface InstancedEvents {
  onDrag?: (node: InternalGraphNode) => void;
  onPointerEnter?: (event: ThreeEvent<MouseEvent>, instance: Instance) => void;
  onPointerLeave?: (event: ThreeEvent<MouseEvent>, instance: Instance) => void;
  onPointerDown?: (event: ThreeEvent<MouseEvent>, instance: Instance) => void;
  onPointerOver?: (event: ThreeEvent<MouseEvent>, instance: Instance) => void;
  onPointerOut?: (event: ThreeEvent<MouseEvent>, instance: Instance) => void;
  onPointerUp?: (event: ThreeEvent<MouseEvent>, instance: Instance) => void;
  onClick?: (event: ThreeEvent<MouseEvent>, instance: Instance) => void;
}

export interface InstancedMeshProps extends InstancedEvents {
  nodes: InternalGraphNode[];
  theme: Theme;
  hoveredNodeId?: string;
  actives?: string[];
  selections?: string[];
  animated?: boolean;
  draggable?: boolean;
  disabled?: boolean;
  draggingIds?: string[];
}
