import { LayoutStrategy } from './types';

/**
 * Promise based tick helper.
 */
export function tick(layout: LayoutStrategy, cb: (stable: boolean) => void) {
  let stable: boolean | undefined;

  function run() {
    if (!stable) {
      stable = layout.step();
      run();
    } else {
      cb(stable);
    }
  }

  run();
}
