/**
 * Viewport-based edge culling system for performance optimization
 * Only renders edges visible in current viewport to improve performance
 */

import {
  Vector3,
  Box3,
  Frustum,
  Camera,
  PerspectiveCamera,
  OrthographicCamera,
  Matrix4
} from 'three';
import { InternalGraphEdge } from '../types';

export interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
  z?: number;
  depth?: number;
}

export interface CullingConfig {
  enableFrustumCulling?: boolean;
  enableViewportCulling?: boolean;
  enableDistanceCulling?: boolean;
  bufferZone?: number;
  maxRenderDistance?: number;
  enableOcclusionCulling?: boolean;
  occlusionSamples?: number;
  adaptiveCulling?: boolean;
  performanceTarget?: number;
}

export interface CullingStats {
  totalEdges: number;
  culledByViewport: number;
  culledByFrustum: number;
  culledByDistance: number;
  culledByOcclusion: number;
  visibleEdges: number;
  cullingTime: number;
  frameRate: number;
}

export interface OcclusionObject {
  position: Vector3;
  radius: number;
  bounds?: Box3;
}

/**
 * High-performance viewport culling for edges
 */
export class ViewportCuller {
  private config: CullingConfig;
  private stats: CullingStats = {
    totalEdges: 0,
    culledByViewport: 0,
    culledByFrustum: 0,
    culledByDistance: 0,
    culledByOcclusion: 0,
    visibleEdges: 0,
    cullingTime: 0,
    frameRate: 60
  };
  private lastFrameTime = 0;

  constructor(config: CullingConfig = {}) {
    this.config = {
      enableFrustumCulling: true,
      enableViewportCulling: true,
      enableDistanceCulling: true,
      bufferZone: 100,
      maxRenderDistance: 2000,
      enableOcclusionCulling: false,
      occlusionSamples: 8,
      adaptiveCulling: true,
      performanceTarget: 60,
      ...config
    };
  }

  /**
   * Cull edges based on viewport visibility
   */
  cullEdges(
    edges: InternalGraphEdge[],
    camera: Camera,
    viewport?: Viewport,
    occluders?: OcclusionObject[]
  ): InternalGraphEdge[] {
    const startTime = performance.now();

    this.stats.totalEdges = edges.length;
    this.stats.culledByViewport = 0;
    this.stats.culledByFrustum = 0;
    this.stats.culledByDistance = 0;
    this.stats.culledByOcclusion = 0;

    let visibleEdges = edges;

    // Apply different culling strategies
    if (this.config.enableViewportCulling && viewport) {
      visibleEdges = this.cullByViewport(visibleEdges, viewport);
    }

    if (this.config.enableFrustumCulling) {
      visibleEdges = this.cullByFrustum(visibleEdges, camera);
    }

    if (this.config.enableDistanceCulling) {
      visibleEdges = this.cullByDistance(visibleEdges, camera);
    }

    if (this.config.enableOcclusionCulling && occluders) {
      visibleEdges = this.cullByOcclusion(visibleEdges, camera, occluders);
    }

    this.stats.visibleEdges = visibleEdges.length;
    this.stats.cullingTime = performance.now() - startTime;
    this.updateFrameRate();

    // Adaptive culling adjustment
    if (this.config.adaptiveCulling) {
      this.adjustCullingParameters();
    }

    return visibleEdges;
  }

  /**
   * Viewport-based culling using 2D bounds
   */
  private cullByViewport(
    edges: InternalGraphEdge[],
    viewport: Viewport
  ): InternalGraphEdge[] {
    const buffer = this.config.bufferZone!;
    const bounds = {
      minX: viewport.x - buffer,
      maxX: viewport.x + viewport.width + buffer,
      minY: viewport.y - buffer,
      maxY: viewport.y + viewport.height + buffer,
      minZ: viewport.z
        ? viewport.z - (viewport.depth || 1000) - buffer
        : -Infinity,
      maxZ: viewport.z
        ? viewport.z + (viewport.depth || 1000) + buffer
        : Infinity
    };

    return edges.filter(edge => {
      const sourcePos = this.getNodePosition(edge.source);
      const targetPos = this.getNodePosition(edge.target);

      if (!sourcePos || !targetPos) {
        this.stats.culledByViewport++;
        return false;
      }

      // Check if either node is within viewport bounds
      const sourceInBounds = this.isPointInBounds(sourcePos, bounds);
      const targetInBounds = this.isPointInBounds(targetPos, bounds);

      if (!sourceInBounds && !targetInBounds) {
        // Check if edge crosses the viewport
        const edgeCrossesViewport = this.lineIntersectsRectangle(
          sourcePos,
          targetPos,
          bounds
        );

        if (!edgeCrossesViewport) {
          this.stats.culledByViewport++;
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Frustum culling using camera's view frustum
   */
  private cullByFrustum(
    edges: InternalGraphEdge[],
    camera: Camera
  ): InternalGraphEdge[] {
    const frustum = new Frustum();
    const matrix = new Matrix4();

    if (
      camera instanceof PerspectiveCamera ||
      camera instanceof OrthographicCamera
    ) {
      matrix.multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      );
      frustum.setFromProjectionMatrix(matrix);
    }

    return edges.filter(edge => {
      const sourcePos = this.getNodePosition(edge.source);
      const targetPos = this.getNodePosition(edge.target);

      if (!sourcePos || !targetPos) {
        this.stats.culledByFrustum++;
        return false;
      }

      const sourceVector = new Vector3(
        sourcePos.x,
        sourcePos.y,
        sourcePos.z || 0
      );
      const targetVector = new Vector3(
        targetPos.x,
        targetPos.y,
        targetPos.z || 0
      );

      // Check if either point is in frustum
      const sourceInFrustum = frustum.containsPoint(sourceVector);
      const targetInFrustum = frustum.containsPoint(targetVector);

      if (!sourceInFrustum && !targetInFrustum) {
        // Check if edge intersects frustum using bounding box
        const edgeBounds = new Box3().setFromPoints([
          sourceVector,
          targetVector
        ]);
        if (!frustum.intersectsBox(edgeBounds)) {
          this.stats.culledByFrustum++;
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Distance-based culling
   */
  private cullByDistance(
    edges: InternalGraphEdge[],
    camera: Camera
  ): InternalGraphEdge[] {
    const maxDistance = this.config.maxRenderDistance!;
    const cameraPos = camera.position;

    return edges.filter(edge => {
      const sourcePos = this.getNodePosition(edge.source);
      const targetPos = this.getNodePosition(edge.target);

      if (!sourcePos || !targetPos) {
        this.stats.culledByDistance++;
        return false;
      }

      // Calculate minimum distance from camera to edge
      const edgeCenter = new Vector3(
        (sourcePos.x + targetPos.x) / 2,
        (sourcePos.y + targetPos.y) / 2,
        ((sourcePos.z || 0) + (targetPos.z || 0)) / 2
      );

      const distance = cameraPos.distanceTo(edgeCenter);

      if (distance > maxDistance) {
        this.stats.culledByDistance++;
        return false;
      }

      return true;
    });
  }

  /**
   * Occlusion culling for edges behind large objects
   */
  private cullByOcclusion(
    edges: InternalGraphEdge[],
    camera: Camera,
    occluders: OcclusionObject[]
  ): InternalGraphEdge[] {
    if (occluders.length === 0) return edges;

    return edges.filter(edge => {
      const sourcePos = this.getNodePosition(edge.source);
      const targetPos = this.getNodePosition(edge.target);

      if (!sourcePos || !targetPos) {
        this.stats.culledByOcclusion++;
        return false;
      }

      const edgeStart = new Vector3(sourcePos.x, sourcePos.y, sourcePos.z || 0);
      const edgeEnd = new Vector3(targetPos.x, targetPos.y, targetPos.z || 0);

      if (this.isEdgeOccluded(edgeStart, edgeEnd, camera, occluders)) {
        this.stats.culledByOcclusion++;
        return false;
      }

      return true;
    });
  }

  /**
   * Check if edge is occluded by objects
   */
  private isEdgeOccluded(
    start: Vector3,
    end: Vector3,
    camera: Camera,
    occluders: OcclusionObject[]
  ): boolean {
    const samples = this.config.occlusionSamples!;
    const cameraPos = camera.position;

    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const samplePoint = start.clone().lerp(end, t);

      for (const occluder of occluders) {
        // Check if sample point is occluded
        const pointToOccluder = samplePoint.distanceTo(occluder.position);
        const pointToCamera = samplePoint.distanceTo(cameraPos);
        const occluderToCamera = occluder.position.distanceTo(cameraPos);

        // Simple sphere occlusion test
        if (
          pointToOccluder < occluder.radius &&
          occluderToCamera < pointToCamera
        ) {
          // Check if ray from camera to point intersects occluder
          const rayDirection = samplePoint.clone().sub(cameraPos).normalize();
          const occluderDirection = occluder.position
            .clone()
            .sub(cameraPos)
            .normalize();

          const dot = rayDirection.dot(occluderDirection);
          const projectedDistance = occluderToCamera * dot;

          if (projectedDistance > 0 && projectedDistance < pointToCamera) {
            const projectedPoint = cameraPos
              .clone()
              .add(rayDirection.clone().multiplyScalar(projectedDistance));
            const distanceToOccluder = projectedPoint.distanceTo(
              occluder.position
            );

            if (distanceToOccluder < occluder.radius) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  /**
   * Check if point is within bounds
   */
  private isPointInBounds(
    point: { x: number; y: number; z?: number },
    bounds: {
      minX: number;
      maxX: number;
      minY: number;
      maxY: number;
      minZ: number;
      maxZ: number;
    }
  ): boolean {
    return (
      point.x >= bounds.minX &&
      point.x <= bounds.maxX &&
      point.y >= bounds.minY &&
      point.y <= bounds.maxY &&
      (point.z || 0) >= bounds.minZ &&
      (point.z || 0) <= bounds.maxZ
    );
  }

  /**
   * Check if line intersects rectangle (for edge-viewport intersection)
   */
  private lineIntersectsRectangle(
    start: { x: number; y: number; z?: number },
    end: { x: number; y: number; z?: number },
    bounds: {
      minX: number;
      maxX: number;
      minY: number;
      maxY: number;
      minZ: number;
      maxZ: number;
    }
  ): boolean {
    // Simplified 2D line-rectangle intersection
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);

    return (
      maxX >= bounds.minX &&
      minX <= bounds.maxX &&
      maxY >= bounds.minY &&
      minY <= bounds.maxY
    );
  }

  /**
   * Get node position (connects to graph store)
   */
  private getNodePosition(
    nodeId: string
  ): { x: number; y: number; z?: number } | null {
    // Placeholder - in real implementation, this would query the graph store
    return { x: 0, y: 0, z: 0 };
  }

  /**
   * Update frame rate calculation
   */
  private updateFrameRate(): void {
    const now = performance.now();
    if (this.lastFrameTime > 0) {
      const frameDelta = now - this.lastFrameTime;
      this.stats.frameRate = 1000 / frameDelta;
    }
    this.lastFrameTime = now;
  }

  /**
   * Adaptive culling parameter adjustment
   */
  private adjustCullingParameters(): void {
    const target = this.config.performanceTarget!;
    const current = this.stats.frameRate;

    if (current < target * 0.8) {
      // Performance is poor - be more aggressive with culling
      this.config.maxRenderDistance = Math.max(
        500,
        this.config.maxRenderDistance! * 0.9
      );
      this.config.bufferZone = Math.max(50, this.config.bufferZone! * 0.9);
    } else if (
      current > target * 1.1 &&
      this.stats.visibleEdges < this.stats.totalEdges * 0.5
    ) {
      // Performance is good but we're culling too much - be less aggressive
      this.config.maxRenderDistance = Math.min(
        3000,
        this.config.maxRenderDistance! * 1.1
      );
      this.config.bufferZone = Math.min(200, this.config.bufferZone! * 1.1);
    }
  }

  /**
   * Get detailed culling statistics
   */
  getStats(): CullingStats {
    return { ...this.stats };
  }

  /**
   * Get culling efficiency ratio
   */
  getCullingEfficiency(): {
    overallCullingRatio: number;
    viewportCullingRatio: number;
    frustumCullingRatio: number;
    distanceCullingRatio: number;
    occlusionCullingRatio: number;
    performanceGain: number;
    } {
    const total = this.stats.totalEdges;
    const visible = this.stats.visibleEdges;

    return {
      overallCullingRatio: total > 0 ? (total - visible) / total : 0,
      viewportCullingRatio: total > 0 ? this.stats.culledByViewport / total : 0,
      frustumCullingRatio: total > 0 ? this.stats.culledByFrustum / total : 0,
      distanceCullingRatio: total > 0 ? this.stats.culledByDistance / total : 0,
      occlusionCullingRatio:
        total > 0 ? this.stats.culledByOcclusion / total : 0,
      performanceGain: total > 0 ? total / Math.max(1, visible) : 1
    };
  }

  /**
   * Configure culling parameters
   */
  updateConfig(newConfig: Partial<CullingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Enable/disable specific culling methods
   */
  setCullingMethod(method: keyof CullingConfig, enabled: boolean): void {
    (this.config as any)[method] = enabled;
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalEdges: 0,
      culledByViewport: 0,
      culledByFrustum: 0,
      culledByDistance: 0,
      culledByOcclusion: 0,
      visibleEdges: 0,
      cullingTime: 0,
      frameRate: 60
    };
  }

  /**
   * Get optimal culling settings for current performance
   */
  getOptimalSettings(
    edgeCount: number,
    targetFrameRate: number = 60
  ): Partial<CullingConfig> {
    if (edgeCount < 1000) {
      return {
        enableViewportCulling: false,
        enableFrustumCulling: true,
        enableDistanceCulling: false,
        bufferZone: 200
      };
    } else if (edgeCount < 5000) {
      return {
        enableViewportCulling: true,
        enableFrustumCulling: true,
        enableDistanceCulling: true,
        bufferZone: 150,
        maxRenderDistance: 1500
      };
    } else {
      return {
        enableViewportCulling: true,
        enableFrustumCulling: true,
        enableDistanceCulling: true,
        enableOcclusionCulling: true,
        bufferZone: 100,
        maxRenderDistance: 1000,
        occlusionSamples: 4
      };
    }
  }
}
