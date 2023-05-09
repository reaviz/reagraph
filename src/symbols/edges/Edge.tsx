import React, { FC, useCallback, useMemo } from 'react';
import { useSpring, a } from '@react-spring/three';
import { Html } from '@react-three/drei';
import { ColorRepresentation, Euler } from 'three';

import { useStore } from '../../store';
import { Theme } from '../../themes';
import { ContextMenuEvent, InternalGraphEdge } from '../../types';
import {
  animationConfig,
  getLabelOffsetByType,
  getMidPoint
} from '../../utils';
import { Label } from '../Label';

export const LABEL_FONT_SIZE = 6;

/**
 * Label positions relatively edge
 *
 * below: show label under the edge line
 * above: show label above the edge line
 * inline: show label along the edge line
 * natural: normal text positions
 */
export type EdgeLabelPosition = 'below' | 'above' | 'inline' | 'natural';

export type EdgeArrowPosition = 'none' | 'mid' | 'end';

export interface EdgeProps {
  animated?: boolean;
  disabled?: boolean;
  color: ColorRepresentation;
  contextMenu?: (event: Partial<ContextMenuEvent>) => React.ReactNode;
  edge: InternalGraphEdge;
  labelPlacement?: EdgeLabelPosition;
  opacity?: number;
  theme: Theme;
}

export const Edge: FC<EdgeProps> = ({
  animated,
  color,
  contextMenu,
  edge,
  labelPlacement,
  opacity,
  theme
}) => {
  const { toId, fromId, label, labelVisible = false, size = 1 } = edge;

  const nodes = useStore(store => store.nodes);
  const from = nodes.find(node => node.id === fromId);
  const to = nodes.find(node => node.id === toId);
  const draggingId = useStore(state => state.draggingId);

  const labelOffset = (size + LABEL_FONT_SIZE) / 2;

  const midPoint = useMemo(
    () =>
      getMidPoint(
        from.position,
        to.position,
        getLabelOffsetByType(labelOffset, labelPlacement)
      ),
    [from.position, to.position, labelOffset, labelPlacement]
  );

  const edgeContextMenus = useStore(state => state.edgeContextMenus);
  const setEdgeContextMenus = useStore(state => state.setEdgeContextMenus);

  const [{ labelPosition }] = useSpring(
    () => ({
      from: {
        labelPosition: [0, 0, 0]
      },
      to: {
        labelPosition: [midPoint.x, midPoint.y, midPoint.z]
      },
      config: {
        ...animationConfig,
        duration: animated && !draggingId ? undefined : 0
      }
    }),
    [midPoint, animated, draggingId]
  );

  const removeContextMenu = useCallback(
    (edge: InternalGraphEdge) => {
      edgeContextMenus.delete(edge.id);
      setEdgeContextMenus(new Set(edgeContextMenus.values()));
    },
    [edgeContextMenus, setEdgeContextMenus]
  );

  const labelRotation = useMemo(
    () =>
      new Euler(
        0,
        0,
        labelPlacement === 'natural'
          ? 0
          : Math.atan(
            (to.position.y - from.position.y) /
                (to.position.x - from.position.x)
          )
      ),
    [
      to.position.x,
      to.position.y,
      from.position.x,
      from.position.y,
      labelPlacement
    ]
  );

  return (
    <group>
      {labelVisible && label && (
        <a.group position={labelPosition as any} rotation={labelRotation}>
          <Label
            text={label}
            ellipsis={15}
            stroke={theme.edge.label.stroke}
            color={color}
            opacity={opacity}
            fontSize={LABEL_FONT_SIZE}
          />
        </a.group>
      )}
      {contextMenu && edgeContextMenus.has(edge.id) && (
        <Html prepend={true} center={true} position={midPoint}>
          {contextMenu({
            data: edge,
            onClose: () => removeContextMenu(edge)
          })}
        </Html>
      )}
    </group>
  );
};

Edge.defaultProps = {
  labelPlacement: 'inline'
};
