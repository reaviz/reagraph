import React, { useEffect, useState } from 'react';
import { Html } from '@react-three/drei';
import { useStore } from 'store';

/**
 * MiniMap component for displaying a static overview of the graph.
 * Usage:
 * ```
 * <GraphCanvas nodes={nodes} edges={edges}>
 *   <MiniMap
 *     position="bottom-left"
 *     width={200}
 *     height={130}
 *   />
 * </GraphCanvas>
 * ```
 */
export interface MiniMapProps {
  width?: number;
  height?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

// Position styles
const POSITION_STYLES: Record<MiniMapProps['position'], React.CSSProperties> = {
  'top-left': { top: 15, left: 15 },
  'top-right': { top: 15, right: 15 },
  'bottom-left': { bottom: 15, left: 15 },
  'bottom-right': { bottom: 15, right: 15 }
};

export const MiniMap: React.FC<MiniMapProps> = ({
  width = 200,
  height = 130,
  position = 'bottom-right'
}) => {
  const [graphImage, setGraphImage] = useState<string>('');
  const theme = useStore(state => state.theme);

  // Capture the main graph canvas as PNG
  const captureGraphAsPNG = () => {
    try {
      // Find the main graph canvas element
      const canvasElement = document.querySelector(
        'canvas'
      ) as HTMLCanvasElement;

      if (canvasElement) {
        const dataURL = canvasElement.toDataURL('image/png');
        setGraphImage(dataURL);
      }
    } catch (error) {
      console.error('Failed to capture a minimap:', error);
    }
  };

  // Capture graph on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      captureGraphAsPNG();
    }, 2000); // 2 second timeout required for the graph to render

    return () => clearTimeout(timer);
  }, []);

  return (
    <Html
      style={{
        pointerEvents: 'none'
      }}
    >
      <div
        style={{
          position: 'fixed',
          width,
          height,
          border: `1px solid ${String(theme.node.label.color)}`,
          zIndex: 10,
          backgroundColor: String(theme.canvas.background),
          overflow: 'hidden',
          pointerEvents: 'auto', // Allow interaction within the minimap div
          ...POSITION_STYLES[position]
        }}
      >
        {graphImage ? (
          <img
            src={graphImage}
            alt="Graph minimap"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: String(theme.node.label.color)
            }}
          >
            Loading minimap...
          </div>
        )}
      </div>
    </Html>
  );
};
