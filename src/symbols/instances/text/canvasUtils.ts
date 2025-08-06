import { CanvasTexture } from 'three';
import * as THREE from 'three';
import { Theme } from '../../../themes/theme';

const canvasElements = new Set<HTMLCanvasElement>();
const activeTextures = new Set<string>();
let currentFrame = 0;

const MAX_CACHE_SIZE = 20; // Further reduce cache size to prevent memory issues
const MAX_CANVAS_SIZE = 256; // Smaller canvas dimensions to reduce memory

// Texture cache to prevent memory leaks and WebGL context loss
const textureCache = new Map<
  string,
  {
    texture: CanvasTexture;
    lastUsed: number;
    refCount: number;
    canvas: HTMLCanvasElement;
    isActive: boolean;
    frameProtected: number;
  }
>();

// Minimal cleanup - only remove truly unused textures
export const cleanupTextureCache = () => {
  // Disable most cleanup to prevent text disappearing
  // Only cleanup when cache is extremely large
  if (textureCache.size <= 100) {
    return;
  }

  const now = Date.now();
  const entries = Array.from(textureCache.entries());

  // Only remove textures that are very old and completely unused
  entries.forEach(([key, data]) => {
    const veryOld = now - data.lastUsed > 600000; // 10 minutes
    const completelyUnused = data.refCount === 0 && !data.isActive;
    const notInActiveSet = !activeTextures.has(key);

    if (
      veryOld &&
      completelyUnused &&
      notInActiveSet &&
      textureCache.size > 100
    ) {
      try {
        if (data.texture) {
          data.texture.dispose();
        }
        if (data.canvas) {
          canvasElements.delete(data.canvas);
        }
        textureCache.delete(key);
      } catch (e) {
        console.warn('Error disposing texture:', e);
      }
    }
  });
};

export const createTextTexture = (
  text: string,
  fontSize: number,
  maxWidth: number,
  theme: Theme,
  isActive: boolean = false
) => {
  // Include theme properties in cache key for accurate caching
  const backgroundColor = theme.node.label.backgroundColor;
  const stroke = theme.node.label.stroke;
  const backgroundOpacity = theme.node.label.backgroundOpacity || 0.8;
  const padding = theme.node.label.padding || 2;

  const cacheKey = `${text}|${fontSize}|${maxWidth}|${backgroundColor}|${stroke}|${backgroundOpacity}|${padding}|${isActive}`;
  const cached = textureCache.get(cacheKey);

  if (cached) {
    cached.lastUsed = Date.now();
    cached.refCount++;
    // Ensure texture is still valid and mark as active with frame protection
    if (
      cached.texture &&
      cached.canvas &&
      cached.canvas.width > 0 &&
      cached.canvas.height > 0
    ) {
      cached.isActive = true;
      cached.frameProtected = currentFrame + 60; // Protect for 60 frames (~1 second at 60fps)
      activeTextures.add(cacheKey);
      return cached.texture;
    } else {
      // Remove invalid cache entry
      textureCache.delete(cacheKey);
      canvasElements.delete(cached.canvas);
      activeTextures.delete(cacheKey);
    }
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;

  // Track canvas element for cleanup
  canvasElements.add(canvas);

  context.font = `${fontSize}px Arial, sans-serif`;

  // Handle text wrapping
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (context.measureText(testLine).width <= maxWidth - padding * 4) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  // Size canvas
  const lineHeight = fontSize * 1.2;
  const totalHeight = lines.length * lineHeight;
  let maxLineWidth = 0;
  lines.forEach(line => {
    maxLineWidth = Math.max(maxLineWidth, context.measureText(line).width);
  });

  // Use higher resolution for better quality when zoomed
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for memory
  const desiredWidth = Math.max(16, maxLineWidth + padding * 4);
  const desiredHeight = Math.max(16, totalHeight + padding * 4);
  const targetWidth = Math.max(
    64,
    Math.min(MAX_CANVAS_SIZE, desiredWidth * pixelRatio)
  );
  const targetHeight = Math.max(
    64,
    Math.min(MAX_CANVAS_SIZE, desiredHeight * pixelRatio)
  );

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // Scale context for high DPI
  context.scale(pixelRatio, pixelRatio);

  // Use simple font scaling instead of complex calculations
  let actualFontSize = fontSize;
  if (desiredWidth > MAX_CANVAS_SIZE || desiredHeight > MAX_CANVAS_SIZE) {
    const scaleX = MAX_CANVAS_SIZE / desiredWidth;
    const scaleY = MAX_CANVAS_SIZE / desiredHeight;
    const scale = Math.min(scaleX, scaleY);
    actualFontSize = Math.floor(fontSize * scale);
  }

  // Redraw with potentially scaled font
  context.font = `${actualFontSize * 1.2}px Arial, sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  const actualLineHeight = actualFontSize * 1.2;
  const actualTotalHeight = lines.length * actualLineHeight;
  const startY =
    canvas.height / pixelRatio / 2 - (actualTotalHeight - actualLineHeight) / 2;

  // Clear canvas with transparency
  context.clearRect(
    0,
    0,
    canvas.width / pixelRatio,
    canvas.height / pixelRatio
  );

  // Draw background if specified
  if (backgroundColor) {
    const bgPadding = padding * (actualFontSize / fontSize);
    const bgWidth = canvas.width / pixelRatio - bgPadding * 2;
    const bgHeight = canvas.height / pixelRatio - bgPadding * 2;

    context.fillStyle = backgroundColor as string;
    context.globalAlpha = backgroundOpacity;

    // Draw rounded rectangle background
    const radius = Math.min(bgPadding, 8);
    context.beginPath();
    context.roundRect(bgPadding, bgPadding, bgWidth, bgHeight, radius);
    context.fill();

    context.globalAlpha = 1.0; // Reset alpha
  }

  // Set up text drawing
  context.font = `${actualFontSize}px Arial, sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.lineJoin = 'round';
  context.miterLimit = 2;

  lines.forEach((line, index) => {
    const x = canvas.width / pixelRatio / 2;
    const y = startY + index * actualLineHeight;

    // Draw stroke if specified
    if (stroke) {
      context.strokeStyle = stroke as string;
      context.lineWidth = Math.max(1, actualFontSize / 16);
      context.strokeText(line, x, y);
    } else {
      // Draw multiple stroke layers for soft halo effect (fallback)
      const maxStroke = Math.max(6, actualFontSize / 6);

      // Outer glow layers
      for (let i = maxStroke; i > 0; i--) {
        const alpha = 0.9 * (1 - i / maxStroke);
        context.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
        context.lineWidth = i * 2.5;
        context.strokeText(line, x, y);
      }
    }

    // Draw main text in white to let shader handle coloring
    context.fillStyle = '#ffffff';
    context.globalAlpha = 1.0; // Use full opacity for text
    context.fillText(line, x, y);
    context.globalAlpha = 1.0; // Reset alpha
  });

  const texture = new CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true; // Enable mipmaps for better quality when scaled
  texture.format = THREE.RGBAFormat;
  texture.type = THREE.UnsignedByteType;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  // Force texture upload to prevent deferred allocation issues
  texture.needsUpdate = true;

  // Add validation flag
  (texture as any)._isValid = true;

  // Store in cache with reference counting and canvas reference
  textureCache.set(cacheKey, {
    texture,
    lastUsed: Date.now(),
    refCount: 1,
    canvas,
    isActive: true,
    frameProtected: currentFrame + 60 // Protect for 60 frames
  });

  // Mark texture as active
  activeTextures.add(cacheKey);

  // Only trigger cleanup if cache is much larger than limit
  if (textureCache.size > MAX_CACHE_SIZE * 3) {
    setTimeout(() => cleanupTextureCache(), 100);
  }

  return texture;
};
