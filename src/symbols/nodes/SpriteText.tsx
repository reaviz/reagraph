import React, { FC, useRef, useMemo, useLayoutEffect } from 'react';
import { InternalGraphNode } from '../../types';
import { CanvasTexture, NearestFilter, Sprite, SpriteMaterial } from 'three';
import { Color } from 'three';
import { useFrame } from '@react-three/fiber';

interface SpriteTextProps {
  nodes: InternalGraphNode[];
  selections?: string[];
  actives?: string[];
  animated?: boolean;
  fontSize?: number;
  maxWidth?: number;
  padding?: number;
}

// Cache for text textures to prevent recreation
const textureCache = new Map<string, CanvasTexture>();


// Helper function to create text texture
const createTextTexture = (
  text: string,
  fontSize: number = 32,
  color: string = 'white',
  maxWidth: number = 300,
  padding: number = 10
) => {
  const cacheKey = `${text}|${fontSize}|${color}|${maxWidth}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;

  // Set font for measurements
  context.font = `${fontSize}px Arial, sans-serif`;

  // Split text into lines if it's too long
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = context.measureText(testLine);

    if (metrics.width <= maxWidth - padding * 2) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Single word is too long, force it
        lines.push(word);
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  // Calculate canvas dimensions
  const lineHeight = fontSize * 1.2;
  const totalHeight = lines.length * lineHeight;
  let maxLineWidth = 0;

  lines.forEach(line => {
    const metrics = context.measureText(line);
    maxLineWidth = Math.max(maxLineWidth, metrics.width);
  });

  canvas.width = Math.max(256, maxLineWidth + padding * 2);
  canvas.height = Math.max(32, totalHeight + padding * 2);

  // Re-set font after canvas resize (canvas resets context)
  context.font = `${fontSize}px Arial, sans-serif`;
  context.fillStyle = color;
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  // Optional: Add background for better readability
  // context.fillStyle = 'rgba(0, 0, 0, 0.7)';
  // context.fillRect(0, 0, canvas.width, canvas.height);
  // context.fillStyle = color;

  // Draw text lines
  const startY = canvas.height / 2 - (totalHeight - lineHeight) / 2;
  lines.forEach((line, index) => {
    context.fillText(
      line,
      canvas.width / 2,
      startY + index * lineHeight
    );
  });

  const texture = new CanvasTexture(canvas);
  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;
  texture.needsUpdate = true;

  textureCache.set(cacheKey, texture);
  return texture;
};

// Individual sprite component for better control
const TextSprite: FC<{
  node: InternalGraphNode;
  isActive: boolean;
  isSelected: boolean;
  fontSize: number;
  maxWidth: number;
  padding: number;
  animated: boolean;
}> = ({
  node,
  isActive,
  isSelected,
  fontSize,
  maxWidth,
  padding,
  animated
}) => {
  const spriteRef = useRef<Sprite>(null);
  const materialRef = useRef<SpriteMaterial>(null);

  // Create texture and material
  const { texture, material } = useMemo(() => {
    const tex = createTextTexture(
      node.label,
      fontSize,
      node.fill || 'white',
      maxWidth,
      padding
    );

    const mat = new SpriteMaterial({
      map: tex,
      transparent: true,
      alphaTest: 0.1,
      color: new Color(node.fill || 'white')
    });

    return { texture: tex, material: mat };
  }, [node.label, node.fill, fontSize, maxWidth, padding]);

  // Update material properties based on state
  useLayoutEffect(() => {
    if (materialRef.current) {
      const baseOpacity = isActive ? 1.0 : 0.5;
      const selectedOpacity = isSelected ? 1.0 : baseOpacity;

      materialRef.current.opacity = selectedOpacity;
      materialRef.current.color.set(node.fill || 'white');

      // Optional: Add glow effect for selected items
      if (isSelected) {
        materialRef.current.color.multiplyScalar(1.2);
      }
    }
  }, [isActive, isSelected, node.fill]);

  // Optional: Animate sprites
  useFrame(state => {
    if (animated && spriteRef.current) {
      // Subtle floating animation
      const time = state.clock.elapsedTime;
      const offset = Math.sin(time * 2 + node.position?.x * 0.1) * 0.1;

      spriteRef.current.position.y =
        (node.position?.y || 0) - (node.size || 1) * 2.0 + offset;
    }
  });

  // Calculate sprite scale based on node size and text dimensions
  const scale = useMemo(() => {
    const baseScale = (node.size || 1) * 2.0;
    const aspectRatio = material.map ?
      material.map.image.width / material.map.image.height : 1;

    return [
      baseScale * aspectRatio * 0.8,
      baseScale * 0.8,
      1
    ] as [number, number, number];
  }, [material, node.size]);

  return (
    <sprite
      ref={spriteRef}
      position={[
        node.position?.x || 0,
        (node.position?.y || 0) - (node.size || 1) * 2.0,
        (node.position?.z || 0) + 0.1 // Slightly in front to avoid z-fighting
      ]}
      scale={scale}
      userData={{
        nodeId: node.id,
        isLabel: true,
        type: 'sprite-text'
      }}
    >
      <primitive
        ref={materialRef}
        attach="material"
        object={material}
      />
    </sprite>
  );
};

export const SpriteText: FC<SpriteTextProps> = ({
  nodes,
  selections = [],
  actives = [],
  animated = true,
  fontSize = 32,
  maxWidth = 300,
  padding = 10
}) => {
  return (
    <group name="sprite-text-labels">
      {nodes.map(node => (
        <TextSprite
          key={node.id}
          node={node}
          isActive={actives.includes(node.id)}
          isSelected={selections.includes(node.id)}
          fontSize={fontSize}
          maxWidth={maxWidth}
          padding={padding}
          animated={animated}
        />
      ))}
    </group>
  );
};
