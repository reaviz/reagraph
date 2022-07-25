import React, { FC, useLayoutEffect, useMemo, useRef } from 'react';
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
  onClose?: (event: React.MouseEvent<HTMLDivElement>) => void;
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

  useLayoutEffect(() => {
    const timer = timeout.current;
    return () => clearTimeout(timer);
  }, []);

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      role="menu"
      className={css.container}
      onPointerEnter={() => clearTimeout(timeout.current)}
      onPointerLeave={event => {
        clearTimeout(timeout.current);
        timeout.current = setTimeout(() => onClose?.(event), 500);
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
          onClick={event => {
            slice?.onClick(event);
            onClose?.(event);
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
