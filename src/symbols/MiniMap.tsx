import React, { useMemo } from 'react';
import { useStore } from '../store';

interface MiniMapProps {
  width?: number;
  height?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const MiniMap: React.FC<MiniMapProps> = ({
  width = 200,
  height = 150,
  position = 'top-right'
}) => {
  // Get actual nodes with positions from the store
  const storeNodes = useStore(state => state.nodes);
  const storeEdges = useStore(state => state.edges);

  // Calculate positions based on actual node positions from the store
  const nodePositions = useMemo(() => {
    if (storeNodes.length === 0) return {};

    // Calculate bounds of the actual graph
    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;

    storeNodes.forEach(node => {
      if (node.position) {
        minX = Math.min(minX, node.position.x);
        maxX = Math.max(maxX, node.position.x);
        minY = Math.min(minY, node.position.y);
        maxY = Math.max(maxY, node.position.y);
      }
    });

    // If all positions are the same, use a small range
    if (minX === maxX) {
      minX -= 10;
      maxX += 10;
    }
    if (minY === maxY) {
      minY -= 10;
      maxY += 10;
    }

    // Scale and transform to fit minimap
    const padding = 20;
    const graphWidth = maxX - minX;
    const graphHeight = maxY - minY;

    const scaleX = (width - 2 * padding) / Math.max(graphWidth, 1);
    const scaleY = (height - 2 * padding) / Math.max(graphHeight, 1);
    const scale = Math.min(scaleX, scaleY);

    // Calculate centering offsets
    const scaledGraphWidth = graphWidth * scale;
    const scaledGraphHeight = graphHeight * scale;
    const offsetX = (width - scaledGraphWidth) / 2;
    const offsetY = (height - scaledGraphHeight) / 2;

    // Transform positions
    const positions: { [key: string]: { x: number; y: number } } = {};
    storeNodes.forEach(node => {
      if (node.position) {
        const transformedX = (node.position.x - minX) * scale + offsetX;
        // Invert Y-axis to match 3D scene coordinate system
        const transformedY =
          height - ((node.position.y - minY) * scale + offsetY);
        positions[node.id] = { x: transformedX, y: transformedY };
      } else {
        // Fallback to circular layout if no position
        const index = storeNodes.indexOf(node);
        const angle = (index / storeNodes.length) * 2 * Math.PI;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.35;
        positions[node.id] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        };
      }
    });

    return positions;
  }, [storeNodes, width, height]);

  // Position styles
  const positionStyles = {
    'top-left': { top: 15, left: 15 },
    'top-right': { top: 15, right: 15 },
    'bottom-left': { bottom: 15, left: 15 },
    'bottom-right': { bottom: 15, right: 15 }
  };

  return (
    <div
      style={{
        position: 'absolute',
        width,
        height,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        ...positionStyles[position]
      }}
    >
      <svg width={width} height={height}>
        {/* Background */}
        <rect width={width} height={height} fill="rgba(255, 255, 255, 0.8)" />

        {/* Edges */}
        {storeEdges.map(edge => {
          const sourcePos = nodePositions[edge.source];
          const targetPos = nodePositions[edge.target];

          if (sourcePos && targetPos) {
            return (
              <line
                key={edge.id}
                x1={sourcePos.x}
                y1={sourcePos.y}
                x2={targetPos.x}
                y2={targetPos.y}
                stroke="#666"
                strokeWidth={1}
                opacity={0.6}
              />
            );
          }
          return null;
        })}

        {/* Nodes */}
        {storeNodes.map(node => {
          const pos = nodePositions[node.id];
          if (pos) {
            return (
              <circle
                key={node.id}
                cx={pos.x}
                cy={pos.y}
                r={3}
                fill="#007bff"
                stroke="#fff"
                strokeWidth={1}
              />
            );
          }
          return null;
        })}
      </svg>
    </div>
  );
};
