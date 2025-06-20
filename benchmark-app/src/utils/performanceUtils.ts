import { PerformanceMetrics, PerformanceTracker } from '../types/benchmark.types';

export class PerformanceTrackerImpl implements PerformanceTracker {
  private metrics: PerformanceMetrics[] = [];
  private rafId: number | null = null;
  private lastTime = 0;
  private isRunning = false;
  private frameCount = 0;
  private startTime = 0;
  private onUpdate?: (metrics: PerformanceMetrics) => void;

  constructor(onUpdate?: (metrics: PerformanceMetrics) => void) {
    this.onUpdate = onUpdate;
  }

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.startTime = performance.now();
    this.lastTime = this.startTime;
    this.frameCount = 0;
    this.tick(this.startTime);
  }

  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  reset(): void {
    this.metrics = [];
    this.frameCount = 0;
    this.startTime = 0;
    this.lastTime = 0;
  }

  private tick = (time: number): void => {
    if (!this.isRunning) return;

    const delta = time - this.lastTime;
    this.frameCount++;
    
    // Calculate FPS (smoothed over last few frames)
    const fps = delta > 0 ? 1000 / delta : 0;
    
    // Get memory usage
    const memory = (performance as any).memory;
    const memoryUsage = memory ? memory.usedJSHeapSize : 0;
    
    const metrics: PerformanceMetrics = {
      fps: Math.round(fps * 100) / 100,
      memoryUsage: Math.round(memoryUsage / 1024 / 1024 * 100) / 100, // MB
      renderTime: Math.round(delta * 100) / 100,
      workerStatus: 'enabled', // Will be updated by components
      nodeCount: 0, // Will be updated by components
      edgeCount: 0, // Will be updated by components
      timestamp: time,
      layoutTime: 0 // Will be updated by layout system
    };

    this.metrics.push(metrics);
    
    // Keep only last 300 samples (5 seconds at 60fps)
    if (this.metrics.length > 300) {
      this.metrics = this.metrics.slice(-300);
    }

    // Notify listeners
    if (this.onUpdate) {
      this.onUpdate(metrics);
    }

    this.lastTime = time;
    this.rafId = requestAnimationFrame(this.tick);
  };

  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  getAverageMetrics(samples = 60): PerformanceMetrics | null {
    if (this.metrics.length === 0) return null;
    
    const recent = this.metrics.slice(-samples);
    if (recent.length === 0) return null;

    const avgFps = recent.reduce((sum, m) => sum + m.fps, 0) / recent.length;
    const avgMemory = recent.reduce((sum, m) => sum + m.memoryUsage, 0) / recent.length;
    const avgRenderTime = recent.reduce((sum, m) => sum + m.renderTime, 0) / recent.length;
    
    const latest = recent[recent.length - 1];
    
    return {
      ...latest,
      fps: Math.round(avgFps * 100) / 100,
      memoryUsage: Math.round(avgMemory * 100) / 100,
      renderTime: Math.round(avgRenderTime * 100) / 100
    };
  }

  getMetricsHistory(): PerformanceMetrics[] {
    return [...this.metrics];
  }
}

export function formatMemorySize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return `${Math.round(bytes / 1024)}KB`;
  if (mb < 1024) return `${Math.round(mb * 100) / 100}MB`;
  return `${Math.round(mb / 1024 * 100) / 100}GB`;
}

export function getPerformanceGrade(fps: number): {
  grade: string;
  color: string;
  description: string;
} {
  if (fps >= 55) {
    return {
      grade: 'A',
      color: '#00ff88',
      description: 'Excellent performance'
    };
  } else if (fps >= 45) {
    return {
      grade: 'B',
      color: '#88ff00',
      description: 'Good performance'
    };
  } else if (fps >= 30) {
    return {
      grade: 'C',
      color: '#ffaa00',
      description: 'Moderate performance'
    };
  } else if (fps >= 20) {
    return {
      grade: 'D',
      color: '#ff6600',
      description: 'Poor performance'
    };
  } else {
    return {
      grade: 'F',
      color: '#ff0000',
      description: 'Unacceptable performance'
    };
  }
}

export function detectWorkerSupport(): boolean {
  try {
    return typeof Worker !== 'undefined' && typeof window !== 'undefined';
  } catch {
    return false;
  }
}

export function getBrowserInfo(): {
  name: string;
  version: string;
  platform: string;
} {
  const ua = navigator.userAgent;
  let name = 'Unknown';
  let version = 'Unknown';
  
  if (ua.includes('Chrome')) {
    name = 'Chrome';
    version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
  } else if (ua.includes('Firefox')) {
    name = 'Firefox';
    version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    name = 'Safari';
    version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
  } else if (ua.includes('Edge')) {
    name = 'Edge';
    version = ua.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
  }
  
  return {
    name,
    version,
    platform: navigator.platform
  };
}