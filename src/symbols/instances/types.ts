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

export interface InstancedMeshProps {
  nodes: InternalGraphNode[];
  theme: Theme;
  actives?: string[];
  selections?: string[];
  animated?: boolean;
  draggable?: boolean;
  disabled?: boolean;
  draggingIds?: string[];
  onDrag?: (node: InternalGraphNode) => void;
  onPointerDown?: (event: ThreeEvent<MouseEvent>, instance: Instance) => void;
  onPointerOver?: (event: ThreeEvent<MouseEvent>, instance: Instance) => void;
  onPointerOut?: (event: ThreeEvent<MouseEvent>, instance: Instance) => void;
  onPointerUp?: (event: ThreeEvent<MouseEvent>, instance: Instance) => void;
  onClick?: (event: ThreeEvent<MouseEvent>, instance: Instance) => void;
}
