import { MenuItem } from './RadialSlice';

export function calculateRadius(items: MenuItem[], startOffsetAngle: number) {
  const centralAngle = 360 / items.length || 360;
  const polar = centralAngle % 180 === 0;
  const deltaAngle = 90 - centralAngle;
  const startAngle = polar
    ? 45
    : startOffsetAngle + deltaAngle + centralAngle / 2;

  return { centralAngle, polar, startAngle, deltaAngle };
}
