import { describe, it, expect } from 'vitest';
import { PerspectiveCamera } from 'three';
import { calcLabelVisibility } from './visibility';

describe('calcLabelVisibility', () => {
  const nodePosition = { x: 0, y: 0, z: 0 };
  const camera = new PerspectiveCamera();
  camera.position.z = 10000;
  camera.zoom = 1;

  it('should always show labels when labelType is "all"', () => {
    const fn = calcLabelVisibility({ nodeCount: 1, labelType: 'all' });
    expect(fn('node', 1)).toBe(true);
    expect(fn('edge', 1)).toBe(true);
  });

  it('should always show node labels when labelType is "nodes"', () => {
    const fn = calcLabelVisibility({ nodeCount: 1, labelType: 'nodes' });
    expect(fn('node', 1)).toBe(true);
    expect(fn('edge', 1)).toBe(false);
  });

  it('should always show edge labels when labelType is "edges"', () => {
    const fn = calcLabelVisibility({ nodeCount: 1, labelType: 'edges' });
    expect(fn('node', 1)).toBe(false);
    expect(fn('edge', 1)).toBe(true);
  });

  it('should never show labels when labelType is "none"', () => {
    const fn = calcLabelVisibility({ nodeCount: 1, labelType: 'none' });
    expect(fn('node', 1)).toBe(false);
    expect(fn('edge', 1)).toBe(false);
  });

  it('should show node label in "auto" if size > 7', () => {
    const fn = calcLabelVisibility({ nodeCount: 1, labelType: 'auto' });
    expect(fn('node', 8)).toBe(true);
  });

  it('should show node label in "auto" if camera is close', () => {
    const closeCamera = new PerspectiveCamera();
    closeCamera.position.z = 1000;
    closeCamera.zoom = 1;
    const fn = calcLabelVisibility({
      nodeCount: 1,
      labelType: 'auto',
      nodePosition,
      camera: closeCamera
    });
    expect(fn('node', 1)).toBe(true);
  });

  it('should not show node label in "auto" if size <= 7 and camera is far', () => {
    const fn = calcLabelVisibility({
      nodeCount: 1,
      labelType: 'auto',
      nodePosition,
      camera
    });
    expect(fn('node', 1)).toBe(false);
  });

  it('should not show edge label in "auto"', () => {
    const fn = calcLabelVisibility({ nodeCount: 1, labelType: 'auto' });
    expect(fn('edge', 1)).toBe(false);
  });

  it('should hide label if camera is far and not always visible', () => {
    const fn = calcLabelVisibility({
      nodeCount: 1,
      labelType: 'auto',
      nodePosition,
      camera
    });
    expect(fn('node', 1)).toBe(false);
  });

  it('should not throw if camera or nodePosition is undefined', () => {
    const fn = calcLabelVisibility({ nodeCount: 1, labelType: 'auto' });
    expect(fn('node', 1)).toBe(false);
    expect(fn('edge', 1)).toBe(false);
  });
});
