import circularLayout2d from 'ngraph.circular.fixed';

export const circular2d = ({ graph }) =>
  circularLayout2d(graph, {
    radius: 300,
    center: { x: 0, y: 0 }
  });
