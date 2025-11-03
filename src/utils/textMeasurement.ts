export interface TextDimensions {
  width: number;
  height: number;
}

export interface TextMeasurementOptions {
  text: string;
  fontSize: number;
  fontWeight?: number;
  fontFamily?: string;
}

// Cache to avoid repeated measurements
const measurementCache = new Map<string, TextDimensions>();

// Reusable canvas context for measurements
let canvasContext: CanvasRenderingContext2D | null = null;

/**
 * Get or create a canvas context for text measurements.
 */
function getCanvasContext(): CanvasRenderingContext2D {
  if (!canvasContext) {
    const canvas = document.createElement('canvas');
    canvasContext = canvas.getContext('2d');

    if (!canvasContext) {
      throw new Error('Failed to create canvas context for text measurement');
    }
  }

  return canvasContext;
}

/**
 * Generate a cache key from measurement options.
 */
function getCacheKey(options: TextMeasurementOptions): string {
  const {
    text,
    fontSize,
    fontWeight = 400,
    fontFamily = 'sans-serif'
  } = options;
  return `${text}|${fontSize}|${fontWeight}|${fontFamily}`;
}

/**
 * Measure text dimensions using Canvas API.
 * Results are cached for performance.
 *
 * @param options - Text measurement options
 * @returns Text dimensions (width and height)
 */
export function measureText(options: TextMeasurementOptions): TextDimensions {
  const cacheKey = getCacheKey(options);

  // Return cached result if available
  const cached = measurementCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const {
    text,
    fontSize,
    fontWeight = 400,
    fontFamily = 'sans-serif'
  } = options;

  try {
    const context = getCanvasContext();

    // Set font properties
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

    // Measure text
    const metrics = context.measureText(text);

    // Calculate dimensions
    const dimensions: TextDimensions = {
      width: metrics.width,
      // Use actual bounding box height if available, otherwise estimate from font size
      height:
        metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent ||
        fontSize * 1.2
    };

    // Cache the result
    measurementCache.set(cacheKey, dimensions);

    return dimensions;
  } catch (error) {
    console.warn('Failed to measure text, falling back to estimation:', error);

    // Fallback to estimation if measurement fails
    const fallback: TextDimensions = {
      width: text.length * fontSize * 0.6,
      height: fontSize * 1.2
    };

    return fallback;
  }
}

/**
 * Clear the measurement cache.
 * Useful for testing or memory management.
 */
export function clearMeasurementCache(): void {
  measurementCache.clear();
}

/**
 * Get the current cache size.
 */
export function getMeasurementCacheSize(): number {
  return measurementCache.size;
}
