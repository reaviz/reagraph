import circular from 'graphology-layout/circular';
import { LayoutFactoryProps } from './types';

export interface CircularLayoutInputs extends LayoutFactoryProps {}

export const circular2d = ({ graph }: CircularLayoutInputs) => {
  const layout = circular(graph);

  return {
    step() {
      return true;
    },
    getNodePosition(id: string) {
      return layout?.[id];
    }
  };
};
