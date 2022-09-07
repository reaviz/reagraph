import circularLayout2d from 'ngraph.circular.fixed';
import { LayoutFactoryProps } from './types';

export interface CircularLayoutInputs extends LayoutFactoryProps {
  radius: number;
}

export const circular2d = ({ graph, radius = 300 }: CircularLayoutInputs) =>
  circularLayout2d(graph, {
    radius,
    center: { x: 0, y: 0 }
  });
