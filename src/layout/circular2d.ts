import circular from 'graphology-layout/circular';
import { LayoutFactoryProps } from './types';

export interface CircularLayoutInputs extends LayoutFactoryProps {
  radius: 300;
}

export const circular2d = ({ graph, radius }: CircularLayoutInputs) => {
  const layout = circular(graph, {
    scale: radius
  });

  return {
    step() {
      return true;
    },
    getNodePosition(id: string) {
      return layout?.[id];
    }
  };
};
