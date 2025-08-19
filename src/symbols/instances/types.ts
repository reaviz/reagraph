import { ThreeEvent } from '@react-three/fiber';
import { InstancedEntity } from '@three.ez/instanced-mesh';
import { Theme } from '../../themes/theme';
import { InstancedEvents, InternalGraphNode } from '../../types';

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
