import { describe, expect, test, beforeEach, vi } from 'vitest';

import {
  measureText,
  clearMeasurementCache,
  getMeasurementCacheSize
} from './textMeasurement';

// Mock canvas context for testing
class MockCanvasRenderingContext2D {
  font = '';

  measureText(text: string) {
    // Parse font to get fontSize
    const fontSizeMatch = this.font.match(/(\d+)px/);
    const fontSize = fontSizeMatch ? parseInt(fontSizeMatch[1], 10) : 16;
    const fontWeightMatch = this.font.match(/^(\d+)/);
    const fontWeight = fontWeightMatch ? parseInt(fontWeightMatch[1], 10) : 400;

    // Simulate different widths for different font weights
    const weightMultiplier = fontWeight >= 700 ? 1.15 : 1;

    return {
      width: text.length * fontSize * 0.6 * weightMultiplier,
      actualBoundingBoxAscent: fontSize * 0.75,
      actualBoundingBoxDescent: fontSize * 0.25
    };
  }
}

// Mock HTMLCanvasElement.prototype.getContext
beforeEach(() => {
  clearMeasurementCache();

  // Mock canvas getContext
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    new MockCanvasRenderingContext2D() as any
  );
});

describe('measureText', () => {
  test('should measure basic text dimensions', () => {
    const result = measureText({
      text: 'Hello',
      fontSize: 16
    });

    expect(result).toBeDefined();
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
    expect(typeof result.width).toBe('number');
    expect(typeof result.height).toBe('number');
  });

  test('should return different widths for different text', () => {
    const short = measureText({ text: 'Hi', fontSize: 16 });
    const long = measureText({ text: 'Hello World', fontSize: 16 });

    expect(long.width).toBeGreaterThan(short.width);
  });

  test('should scale width with font size', () => {
    const small = measureText({ text: 'Test', fontSize: 12 });
    const large = measureText({ text: 'Test', fontSize: 24 });

    expect(large.width).toBeGreaterThan(small.width);
    expect(large.height).toBeGreaterThan(small.height);
  });

  test('should handle different font weights', () => {
    const normal = measureText({
      text: 'Test',
      fontSize: 16,
      fontWeight: 400
    });
    const bold = measureText({
      text: 'Test',
      fontSize: 16,
      fontWeight: 700
    });

    // Bold text should be wider than normal weight
    expect(bold.width).toBeGreaterThanOrEqual(normal.width);
  });

  test('should handle different font families', () => {
    const sansSerif = measureText({
      text: 'Test',
      fontSize: 16,
      fontFamily: 'sans-serif'
    });
    const monospace = measureText({
      text: 'Test',
      fontSize: 16,
      fontFamily: 'monospace'
    });

    // Both should produce valid measurements
    expect(sansSerif.width).toBeGreaterThan(0);
    expect(monospace.width).toBeGreaterThan(0);
  });

  test('should handle empty string', () => {
    const result = measureText({
      text: '',
      fontSize: 16
    });

    expect(result.width).toBe(0);
    expect(result.height).toBeGreaterThan(0);
  });

  test('should handle special characters', () => {
    const result = measureText({
      text: '🎉✨💯',
      fontSize: 16
    });

    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });

  test('should handle very long text', () => {
    const longText = 'A'.repeat(1000);
    const result = measureText({
      text: longText,
      fontSize: 16
    });

    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });
});

describe('caching behavior', () => {
  test('should cache measurements', () => {
    // First call
    const first = measureText({ text: 'Test', fontSize: 16 });
    expect(getMeasurementCacheSize()).toBe(1);

    // Second call with same parameters should use cache
    const second = measureText({ text: 'Test', fontSize: 16 });
    expect(getMeasurementCacheSize()).toBe(1);

    // Results should be identical (same object reference due to caching)
    expect(first).toBe(second);
  });

  test('should create separate cache entries for different text', () => {
    measureText({ text: 'Hello', fontSize: 16 });
    measureText({ text: 'World', fontSize: 16 });

    expect(getMeasurementCacheSize()).toBe(2);
  });

  test('should create separate cache entries for different font sizes', () => {
    measureText({ text: 'Test', fontSize: 12 });
    measureText({ text: 'Test', fontSize: 16 });
    measureText({ text: 'Test', fontSize: 24 });

    expect(getMeasurementCacheSize()).toBe(3);
  });

  test('should create separate cache entries for different font weights', () => {
    measureText({ text: 'Test', fontSize: 16, fontWeight: 400 });
    measureText({ text: 'Test', fontSize: 16, fontWeight: 700 });

    expect(getMeasurementCacheSize()).toBe(2);
  });

  test('should create separate cache entries for different font families', () => {
    measureText({ text: 'Test', fontSize: 16, fontFamily: 'sans-serif' });
    measureText({ text: 'Test', fontSize: 16, fontFamily: 'monospace' });

    expect(getMeasurementCacheSize()).toBe(2);
  });

  test('should use default font weight in cache key', () => {
    // These should use the same cache entry (default fontWeight is 400)
    const first = measureText({ text: 'Test', fontSize: 16 });
    const second = measureText({ text: 'Test', fontSize: 16, fontWeight: 400 });

    expect(getMeasurementCacheSize()).toBe(1);
    expect(first).toBe(second);
  });

  test('should use default font family in cache key', () => {
    // These should use the same cache entry (default fontFamily is 'sans-serif')
    const first = measureText({ text: 'Test', fontSize: 16 });
    const second = measureText({
      text: 'Test',
      fontSize: 16,
      fontFamily: 'sans-serif'
    });

    expect(getMeasurementCacheSize()).toBe(1);
    expect(first).toBe(second);
  });
});

describe('clearMeasurementCache', () => {
  test('should clear all cached measurements', () => {
    measureText({ text: 'Test1', fontSize: 16 });
    measureText({ text: 'Test2', fontSize: 16 });
    measureText({ text: 'Test3', fontSize: 16 });

    expect(getMeasurementCacheSize()).toBe(3);

    clearMeasurementCache();

    expect(getMeasurementCacheSize()).toBe(0);
  });

  test('should allow new measurements after clearing', () => {
    const first = measureText({ text: 'Test', fontSize: 16 });
    clearMeasurementCache();

    const second = measureText({ text: 'Test', fontSize: 16 });

    // Should have different object references (not from cache)
    expect(first).not.toBe(second);
    // But same values
    expect(first.width).toBe(second.width);
    expect(first.height).toBe(second.height);
  });
});

describe('getMeasurementCacheSize', () => {
  test('should return 0 for empty cache', () => {
    expect(getMeasurementCacheSize()).toBe(0);
  });

  test('should return correct size as cache grows', () => {
    expect(getMeasurementCacheSize()).toBe(0);

    measureText({ text: 'Test1', fontSize: 16 });
    expect(getMeasurementCacheSize()).toBe(1);

    measureText({ text: 'Test2', fontSize: 16 });
    expect(getMeasurementCacheSize()).toBe(2);

    measureText({ text: 'Test3', fontSize: 16 });
    expect(getMeasurementCacheSize()).toBe(3);
  });

  test('should not increment size for cached measurements', () => {
    measureText({ text: 'Test', fontSize: 16 });
    expect(getMeasurementCacheSize()).toBe(1);

    // Call again with same parameters
    measureText({ text: 'Test', fontSize: 16 });
    measureText({ text: 'Test', fontSize: 16 });
    measureText({ text: 'Test', fontSize: 16 });

    expect(getMeasurementCacheSize()).toBe(1);
  });
});

describe('edge cases', () => {
  test('should handle very small font sizes', () => {
    const result = measureText({ text: 'Test', fontSize: 1 });

    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });

  test('should handle very large font sizes', () => {
    const result = measureText({ text: 'Test', fontSize: 1000 });

    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });

  test('should handle extreme font weights', () => {
    const thin = measureText({ text: 'Test', fontSize: 16, fontWeight: 100 });
    const heavy = measureText({ text: 'Test', fontSize: 16, fontWeight: 900 });

    expect(thin.width).toBeGreaterThan(0);
    expect(heavy.width).toBeGreaterThan(0);
    expect(heavy.width).toBeGreaterThanOrEqual(thin.width);
  });

  test('should handle whitespace-only text', () => {
    const result = measureText({ text: '   ', fontSize: 16 });

    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });

  test('should handle newline characters', () => {
    const result = measureText({ text: 'Hello\nWorld', fontSize: 16 });

    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });
});
