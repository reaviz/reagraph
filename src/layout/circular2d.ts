import circular from 'graphology-layout/circular';
import { LayoutFactoryProps } from './types';

export interface CircularLayoutInputs extends LayoutFactoryProps {
  radius: 300;
}

export const circular2d = ({ graph, radius, drags }: CircularLayoutInputs) => {
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
};
