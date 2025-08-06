import React, { FC, useRef, useState } from 'react';
import { InstancedSpriteText, OptimizedTextProps } from './InstancedSpriteText';
import { useFrame, useThree } from '@react-three/fiber';
import { InternalGraphNode } from '../../../types';
import { Frustum, Matrix4, Vector3 } from 'three';

export const CulledText: FC<OptimizedTextProps> = ({
  nodes,
  selections = [],
  actives = [],
  animated = false,
  fontSize = 32,
  maxWidth = 300,
  theme
}) => {
  const { camera, size } = useThree();
  const [visibleNodes, setVisibleNodes] = useState<InternalGraphNode[]>([]);
  const frustumRef = useRef(new Frustum());
  const matrixRef = useRef(new Matrix4());
  const frameCountRef = useRef(0);

  const lastCameraPositionRef = useRef<{ x: number; y: number; z: number }>({
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z
  });
  const lastNodesHashRef = useRef<string>('');

  useFrame(() => {
    frameCountRef.current++;

    // Create a hash of node positions to detect changes
    const nodesHash = nodes
      .map(
        n =>
          `${n.id}:${n.position?.x || 0},${n.position?.y || 0},${n.position?.z || 0}`
      )
      .join('|');
    const nodesChanged = lastNodesHashRef.current !== nodesHash;

    // For smooth movement, update every frame when nodes are changing position
    // Only throttle when nodes are static and camera isn't moving
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

    // Always update if camera moved OR nodes changed OR if we don't have any visible nodes yet
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
    <InstancedSpriteText
      nodes={visibleNodes}
      selections={selections}
      actives={actives}
      animated={animated}
      fontSize={fontSize}
      maxWidth={maxWidth}
      theme={theme}
    />
  );
};
