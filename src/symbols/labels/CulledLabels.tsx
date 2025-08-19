import React, { FC, useEffect, useRef, useState } from 'react';
import { Frustum, Matrix4, Vector3 } from 'three';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';

import { InternalGraphNode } from '../../types';
import { Theme } from '../../themes/theme';
import { AnimatedLabel } from './AnimatedLabel';

export interface CulledLabelProps {
  nodes: InternalGraphNode[];
  selections?: string[];
  actives?: string[];
  animated?: boolean;
  draggable?: boolean;
  fontSize?: number;
  theme: Theme;
  draggingIds?: string[];
  hoveredNodeId?: string;
  onPointerOver?: (
    event: ThreeEvent<PointerEvent>,
    node: InternalGraphNode
  ) => void;
  onPointerOut?: (
    event: ThreeEvent<PointerEvent>,
    node: InternalGraphNode
  ) => void;
  onClick?: (event: ThreeEvent<MouseEvent>, node: InternalGraphNode) => void;
  onPointerDown?: (
    event: ThreeEvent<PointerEvent>,
    node: InternalGraphNode
  ) => void;
  onPointerUp?: (
    event: ThreeEvent<PointerEvent>,
    node: InternalGraphNode
  ) => void;
}

export const CulledLabels: FC<CulledLabelProps> = ({
  nodes,
  selections = [],
  actives = [],
  animated = false,
  draggable = false,
  fontSize = 7,
  theme,
  hoveredNodeId,
  draggingIds,
  onPointerDown,
  onPointerUp,
  ...rest
}) => {
  const { camera, size } = useThree();
  const [visibleNodes, setVisibleNodes] = useState<InternalGraphNode[]>([]);
  const frustumRef = useRef(new Frustum());
  const matrixRef = useRef(new Matrix4());
  const frameCountRef = useRef(0);
  const [shouldAnimate, setShouldAnimate] = useState(animated);

  const lastCameraPositionRef = useRef<{ x: number; y: number; z: number }>({
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z
  });
  const lastNodesHashRef = useRef<string>('');

  useEffect(() => {
    setShouldAnimate(animated);
  }, [animated, nodes]);

  useFrame(() => {
    frameCountRef.current++;

    const nodesHash = nodes
      .map(
        n =>
          `${n.id}:${n.position?.x || 0},${n.position?.y || 0},${n.position?.z || 0}`
      )
      .join('|');
    const nodesChanged = lastNodesHashRef.current !== nodesHash;

    const shouldThrottle = !nodesChanged && frameCountRef.current % 30 !== 0;

    if (shouldThrottle) {
      return;
    }

    const lastPos = lastCameraPositionRef.current;
    const currPos = camera.position;
    const hasMoved =
      lastPos.x !== currPos.x ||
      lastPos.y !== currPos.y ||
      lastPos.z !== currPos.z;

    if (!hasMoved && !nodesChanged && visibleNodes.length > 0) {
      return;
    }

    if (nodesChanged) {
      lastNodesHashRef.current = nodesHash;
    }

    lastCameraPositionRef.current = {
      x: currPos.x,
      y: currPos.y,
      z: currPos.z
    };

    matrixRef.current.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    frustumRef.current.setFromProjectionMatrix(matrixRef.current);

    const visible = nodes.filter(node => {
      const nodePosition = new Vector3(
        node.position?.x || 0,
        node.position?.y || 0,
        node.position?.z || 0
      );

      const isInFrustum = frustumRef.current.containsPoint(nodePosition);
      if (!isInFrustum) {
        return false;
      }

      const distance = camera.position.distanceTo(nodePosition);
      if (distance > 8000) {
        return false;
      }

      const screenPosition = nodePosition.clone().project(camera);
      const isOnScreen =
        screenPosition.x >= -1.2 &&
        screenPosition.x <= 1.2 &&
        screenPosition.y >= -1.2 &&
        screenPosition.y <= 1.2 &&
        screenPosition.z >= 0 &&
        screenPosition.z <= 1;

      if (!isOnScreen) {
        return false;
      }

      const nodeSize = node.size || 1;
      const fov = (camera as any).fov;
      let projectedSize = 0;
      if (typeof fov === 'number') {
        projectedSize =
          (nodeSize * size.height) /
          (distance * Math.tan((fov * Math.PI) / 360));
      } else {
        projectedSize = nodeSize * 2;
      }
      if (projectedSize < 10) {
        return false;
      }

      return true;
    });

    const prioritizedVisible = visible
      .map(node => {
        const distance = camera.position.distanceTo(
          new Vector3(
            node.position?.x || 0,
            node.position?.y || 0,
            node.position?.z || 0
          )
        );

        let priority = 1000 - distance;
        if (actives.includes(node.id)) {
          priority += 500;
        }
        if (selections.includes(node.id)) {
          priority += 1000;
        }

        return { node, distance, priority };
      })
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 500)
      .map(item => item.node);

    setVisibleNodes(prioritizedVisible);
  });

  return (
    <>
      {visibleNodes.map(node => (
        <AnimatedLabel
          key={node.id}
          node={node}
          theme={theme}
          selections={selections}
          actives={actives}
          draggingIds={draggingIds}
          hoveredNodeId={hoveredNodeId || ''}
          fontSize={fontSize}
          animated={animated}
          shouldAnimate={shouldAnimate}
          setShouldAnimate={setShouldAnimate}
          onPointerDown={e => {
            if (!draggable) return;
            onPointerDown?.(e, node);
          }}
          onPointerUp={e => {
            if (!draggable) return;
            onPointerUp?.(e, node);
          }}
          {...rest}
        />
      ))}
    </>
  );
};
