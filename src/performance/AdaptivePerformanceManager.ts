export interface PerformanceSettings {
  barnesHutTheta: number;
  edgeLODDistance: number;
  labelLODDistance: number;
  shadowsEnabled: boolean;
  nodeRenderLimit?: number;
  edgeRenderLimit?: number;
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  nodeCount: number;
  edgeCount: number;
  memoryUsage?: number;
}

export type PerformanceMode =
  | 'quality'
  | 'balanced'
  | 'performance'
  | 'ultra-performance';

export class AdaptivePerformanceManager {
  private targetFPS = 60;
  private minFPS = 30;
  private currentFPS = 0;
  private fpsHistory: number[] = [];
  private historySize = 10;

  // Barnes-Hut parameters
  private barnesHutTheta = 0.5;
  private readonly minTheta = 0.3; // More accurate, slower
  private readonly maxTheta = 0.9; // Less accurate, faster

  // Render quality parameters
  private edgeLODDistance = 1000;
  private labelLODDistance = 500;
  private shadowsEnabled = true;
  private nodeRenderLimit?: number;
  private edgeRenderLimit?: number;

  // Performance mode
  private mode: PerformanceMode = 'balanced';
  private lastAdaptTime = 0;
  private adaptInterval = 500; // ms between adaptations

  constructor(targetFPS = 60) {
    this.targetFPS = targetFPS;
    this.minFPS = Math.max(30, targetFPS * 0.5);
  }

  updateMetrics(metrics: PerformanceMetrics): void {
    this.currentFPS = metrics.fps;
    this.fpsHistory.push(metrics.fps);

    if (this.fpsHistory.length > this.historySize) {
      this.fpsHistory.shift();
    }

    const now = Date.now();
    if (now - this.lastAdaptTime > this.adaptInterval) {
      this.adaptPerformance(metrics);
      this.lastAdaptTime = now;
    }
  }

  private adaptPerformance(metrics: PerformanceMetrics): void {
    const avgFPS = this.getAverageFPS();
    const fpsRatio = avgFPS / this.targetFPS;

    // Determine performance mode based on FPS
    if (fpsRatio < 0.5) {
      this.setMode('ultra-performance', metrics);
    } else if (fpsRatio < 0.8) {
      this.setMode('performance', metrics);
    } else if (fpsRatio < 0.95) {
      this.setMode('balanced', metrics);
    } else {
      this.setMode('quality', metrics);
    }

    // Fine-tune Barnes-Hut theta
    if (avgFPS < this.minFPS) {
      // Critical performance - aggressive optimization
      this.increaseApproximation(0.1);
    } else if (avgFPS < this.targetFPS * 0.8) {
      // Below target - gradual optimization
      this.increaseApproximation(0.05);
    } else if (
      avgFPS > this.targetFPS * 0.95 &&
      this.barnesHutTheta > this.minTheta
    ) {
      // Above target - improve quality
      this.decreaseApproximation(0.02);
    }
  }

  private setMode(mode: PerformanceMode, metrics: PerformanceMetrics): void {
    if (this.mode === mode) return;

    this.mode = mode;

    switch (mode) {
    case 'quality':
      this.edgeLODDistance = 2000;
      this.labelLODDistance = 1000;
      this.shadowsEnabled = true;
      this.nodeRenderLimit = undefined;
      this.edgeRenderLimit = undefined;
      break;

    case 'balanced':
      this.edgeLODDistance = 1000;
      this.labelLODDistance = 500;
      this.shadowsEnabled = true;
      this.nodeRenderLimit = metrics.nodeCount > 10000 ? 10000 : undefined;
      this.edgeRenderLimit = metrics.edgeCount > 20000 ? 20000 : undefined;
      break;

    case 'performance':
      this.edgeLODDistance = 500;
      this.labelLODDistance = 250;
      this.shadowsEnabled = false;
      this.nodeRenderLimit = Math.min(metrics.nodeCount, 5000);
      this.edgeRenderLimit = Math.min(metrics.edgeCount, 10000);
      break;

    case 'ultra-performance':
      this.edgeLODDistance = 250;
      this.labelLODDistance = 100;
      this.shadowsEnabled = false;
      this.nodeRenderLimit = Math.min(metrics.nodeCount, 2000);
      this.edgeRenderLimit = Math.min(metrics.edgeCount, 5000);
      break;
    }

    console.log(`[AdaptivePerformanceManager] Switched to ${mode} mode`);
  }

  private increaseApproximation(delta: number): void {
    const oldTheta = this.barnesHutTheta;
    this.barnesHutTheta = Math.min(this.maxTheta, this.barnesHutTheta + delta);

    if (oldTheta !== this.barnesHutTheta) {
      console.log(
        `[AdaptivePerformanceManager] Increased theta: ${oldTheta.toFixed(2)} → ${this.barnesHutTheta.toFixed(2)}`
      );
    }
  }

  private decreaseApproximation(delta: number): void {
    const oldTheta = this.barnesHutTheta;
    this.barnesHutTheta = Math.max(this.minTheta, this.barnesHutTheta - delta);

    if (oldTheta !== this.barnesHutTheta) {
      console.log(
        `[AdaptivePerformanceManager] Decreased theta: ${oldTheta.toFixed(2)} → ${this.barnesHutTheta.toFixed(2)}`
      );
    }
  }

  private getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return this.targetFPS;

    const sum = this.fpsHistory.reduce((acc, fps) => acc + fps, 0);
    return sum / this.fpsHistory.length;
  }

  getPerformanceSettings(): PerformanceSettings {
    return {
      barnesHutTheta: this.barnesHutTheta,
      edgeLODDistance: this.edgeLODDistance,
      labelLODDistance: this.labelLODDistance,
      shadowsEnabled: this.shadowsEnabled,
      nodeRenderLimit: this.nodeRenderLimit,
      edgeRenderLimit: this.edgeRenderLimit
    };
  }

  getCurrentFPS(): number {
    return this.currentFPS;
  }

  getMode(): PerformanceMode {
    return this.mode;
  }

  reset(): void {
    this.fpsHistory = [];
    this.barnesHutTheta = 0.5;
    this.mode = 'balanced';
    this.setMode('balanced', {
      fps: this.targetFPS,
      frameTime: 16.67,
      nodeCount: 0,
      edgeCount: 0
    });
  }

  // Manual override methods
  setTargetFPS(fps: number): void {
    this.targetFPS = fps;
    this.minFPS = Math.max(30, fps * 0.5);
  }

  forceMode(mode: PerformanceMode): void {
    this.setMode(mode, {
      fps: this.currentFPS,
      frameTime: 1000 / Math.max(this.currentFPS, 1),
      nodeCount: 0,
      edgeCount: 0
    });
  }
}
