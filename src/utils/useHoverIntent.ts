import { useCallback, useRef } from 'react';
import { ThreeEvent } from '@react-three/fiber';

export interface HoverIntentOptions {
  interval?: number;
  sensitivity?: number;
  timeout?: number;
  disabled?: boolean;
  onPointerOver: (event: ThreeEvent<PointerEvent>) => void;
  onPointerOut: (event: ThreeEvent<PointerEvent>) => void;
}

export interface HoverIntentResult {
  pointerOut: (event: ThreeEvent<PointerEvent>) => void;
  pointerOver: (event: ThreeEvent<PointerEvent>) => void;
}

/**
 * Hover intent identifies if the user actually is
 * intending to over by measuring the position of the mouse
 * once a pointer enters and determining if in a duration if
 * the mouse moved inside a certain threshold and fires the events.
 */
export const useHoverIntent = ({
  sensitivity = 7,
  interval = 50,
  timeout = 0,
  disabled,
  onPointerOver,
  onPointerOut
}: HoverIntentOptions | undefined): HoverIntentResult => {
  const mouseOver = useRef<boolean>(false);
  const timer = useRef<any | null>(null);
  const state = useRef<number>(0);
  const coords = useRef({
    x: null,
    y: null,
    px: null,
    py: null
  });

  const onMouseMove = useCallback((event: MouseEvent) => {
    coords.current.x = event.clientX;
    coords.current.y = event.clientY;
  }, []);

  const comparePosition = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      timer.current = clearTimeout(timer.current);
      const { px, x, py, y } = coords.current;

      if (Math.abs(px - x) + Math.abs(py - y) < sensitivity) {
        state.current = 1;
        onPointerOver(event);
      } else {
        coords.current.px = x;
        coords.current.py = y;
        timer.current = setTimeout(() => comparePosition(event), interval);
      }
    },
    [interval, onPointerOver, sensitivity]
  );

  const cleanup = useCallback(() => {
    clearTimeout(timer.current);
    if (typeof window !== 'undefined') {
      document.removeEventListener('mousemove', onMouseMove, false);
    }
  }, [onMouseMove]);

  const pointerOver = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (!disabled) {
        mouseOver.current = true;
        cleanup();

        if (state.current !== 1) {
          coords.current.px = event.pointer.x;
          coords.current.py = event.pointer.y;

          if (typeof window !== 'undefined') {
            document.addEventListener('mousemove', onMouseMove, false);
          }

          timer.current = setTimeout(() => comparePosition(event), timeout);
        }
      }
    },
    [cleanup, comparePosition, disabled, onMouseMove, timeout]
  );

  const delay = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      timer.current = clearTimeout(timer.current);
      state.current = 0;
      onPointerOut(event);
    },
    [onPointerOut]
  );

  const pointerOut = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      mouseOver.current = false;
      cleanup();

      if (state.current === 1) {
        timer.current = setTimeout(() => delay(event), timeout);
      }
    },
    [cleanup, delay, timeout]
  );

  return {
    pointerOver,
    pointerOut
  };
};
