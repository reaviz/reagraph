import React, { FC, useEffect, useMemo, useRef } from 'react';
import { RadialSlice, MenuItem } from './RadialSlice';
import { calculateRadius } from './utils';
import { Theme } from '../utils/themes';
import css from './RadialMenu.module.css';

interface RadialMenuProps {
  theme: Theme;
  items: MenuItem[];
  radius?: number;
  innerRadius?: number;
  startOffsetAngle?: number;
  onClose?: () => void;
}

export const RadialMenu: FC<RadialMenuProps> = ({
  items,
  theme,
  radius,
  innerRadius,
  startOffsetAngle,
  onClose
}) => {
  const { centralAngle, polar, startAngle, deltaAngle } = useMemo(
    () => calculateRadius(items, startOffsetAngle),
    [items, startOffsetAngle]
  );
  const timeout = useRef<any | null>(null);

  useEffect(() => {
    return () => {
      clearTimeout(timeout.current);
    };
  });

  return (
    <div
      role="menu"
      className={css.container}
      onPointerEnter={() => clearTimeout(timeout.current)}
      onPointerLeave={() => {
        clearTimeout(timeout.current);
        timeout.current = setTimeout(() => onClose?.(), 500);
      }}
    >
      <style>
        {`
          .${css.container} {
            --background: ${theme.menu.background};
            --color: ${theme.menu.color};
            --border: ${theme.menu.border};
            --active-color: ${theme.menu.activeColor};
            --active-background: ${theme.menu.activeBackground};
          }
        `}
      </style>
      {items.map((slice, index) => (
        <RadialSlice
          key={index}
          {...slice}
          radius={radius}
          innerRadius={innerRadius}
          startAngle={startAngle}
          endAngle={centralAngle * index}
          skew={polar ? 0 : deltaAngle}
          polar={polar}
          centralAngle={centralAngle}
          onClick={() => {
            slice?.onClick();
            onClose?.();
          }}
        />
      ))}
    </div>
  );
};

RadialMenu.defaultProps = {
  radius: 175,
  innerRadius: 25,
  startOffsetAngle: 0
};
