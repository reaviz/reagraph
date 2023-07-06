import circular from 'graphology-layout/circular';
import { LayoutFactoryProps } from './types';

export interface CircularLayoutInputs extends LayoutFactoryProps {
  /**
   * Radius of the circle.
   */
  radius: 300;
}

export function circular2d({ graph, radius, drags }: CircularLayoutInputs) {
  const layout = circular(graph, {
    scale: radius
  });

  return {
    step() {
      return true;
    },
    getNodePosition(id: string) {
      // If we dragged, we need to use that position
      return (drags?.[id]?.position as any) || layout?.[id];
    }
  };
}
