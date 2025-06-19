import {
  BufferGeometry,
  TubeGeometry,
  Vector3,
  CatmullRomCurve3,
  LineBasicMaterial,
  BufferAttribute,
  PerspectiveCamera,
  OrthographicCamera
} from 'three';
import { InternalGraphEdge } from '../types';

export interface LODLevel {
  distance: number;
  segments: number;
  radialSegments: number;
  useSimplifiedGeometry: boolean;
  quality: 'high' | 'medium' | 'low' | 'minimal';
}

export interface EdgeLODConfig {
  lodLevels?: LODLevel[];
  enableFrustumCulling?: boolean;
  enableDistanceCulling?: boolean;
  maxRenderDistance?: number;
  adaptiveQuality?: boolean;
}

export class EdgeLOD {
  private lodLevels: LODLevel[];
  private config: EdgeLODConfig;
  private geometryCache = new Map<string, BufferGeometry>();

  constructor(config: EdgeLODConfig = {}) {
    this.config = {
      enableFrustumCulling: true,
      enableDistanceCulling: true,
      maxRenderDistance: 2000,
      adaptiveQuality: true,
      ...config
    };

    this.lodLevels = config.lodLevels || [
      {
        distance: 0,
        segments: 20,
        radialSegments: 8,
        useSimplifiedGeometry: false,
        quality: 'high'
      },
      {
        distance: 50,
        segments: 12,
        radialSegments: 6,
        useSimplifiedGeometry: false,
        quality: 'medium'
      },
      {
        distance: 200,
        segments: 6,
        radialSegments: 4,
        useSimplifiedGeometry: false,
        quality: 'low'
      },
      {
        distance: 500,
        segments: 2,
        radialSegments: 3,
        useSimplifiedGeometry: true,
        quality: 'minimal'
      }
    ];
  }

  /**
   * Get appropriate geometry for edge based on distance to camera
   */
  getGeometryForDistance(
    edge: InternalGraphEdge,
    distance: number,
    edgeSize: number,
    camera?: PerspectiveCamera | OrthographicCamera
  ): BufferGeometry {
    const lod = this.getLODLevel(distance);
    const cacheKey = this.getGeometryCacheKey(edge, lod, edgeSize);

    if (this.geometryCache.has(cacheKey)) {
      return this.geometryCache.get(cacheKey)!;
    }

    let geometry: BufferGeometry;

    if (lod.useSimplifiedGeometry || distance > 1000) {
      geometry = this.createLineGeometry(edge);
    } else {
      geometry = this.createTubeGeometry(edge, lod, edgeSize);
    }

    this.geometryCache.set(cacheKey, geometry);
    return geometry;
  }

  /**
   * Determine LOD level based on distance
   */
  private getLODLevel(distance: number): LODLevel {
    // Find the appropriate LOD level
    for (let i = this.lodLevels.length - 1; i >= 0; i--) {
      if (distance >= this.lodLevels[i].distance) {
        return this.lodLevels[i];
      }
    }
    return this.lodLevels[0]; // Fallback to highest quality
  }

  /**
   * Calculate distance from edge to camera
   */
  calculateEdgeDistance(
    edge: InternalGraphEdge,
    camera: PerspectiveCamera | OrthographicCamera
  ): number {
    const sourcePos = this.getNodePosition(edge.source);
    const targetPos = this.getNodePosition(edge.target);

    if (!sourcePos || !targetPos) {
      return this.config.maxRenderDistance!;
    }

    // Calculate midpoint of edge
    const midpoint = new Vector3(
      (sourcePos.x + targetPos.x) / 2,
      (sourcePos.y + targetPos.y) / 2,
      ((sourcePos.z || 0) + (targetPos.z || 0)) / 2
    );

    return camera.position.distanceTo(midpoint);
  }

  /**
   * Check if edge should be rendered based on distance and frustum culling
   */
  shouldRenderEdge(
    edge: InternalGraphEdge,
    camera: PerspectiveCamera | OrthographicCamera
  ): boolean {
    const distance = this.calculateEdgeDistance(edge, camera);

    // Distance culling
    if (
      this.config.enableDistanceCulling &&
      distance > this.config.maxRenderDistance!
    ) {
      return false;
    }

    // Frustum culling
    if (this.config.enableFrustumCulling) {
      return this.isEdgeInFrustum(edge, camera);
    }

    return true;
  }

  /**
   * Check if edge intersects with camera frustum
   */
  private isEdgeInFrustum(
    edge: InternalGraphEdge,
    camera: PerspectiveCamera | OrthographicCamera
  ): boolean {
    const sourcePos = this.getNodePosition(edge.source);
    const targetPos = this.getNodePosition(edge.target);

    if (!sourcePos || !targetPos) {
      return false;
    }

    // Simplified frustum culling - check if either node is in view
    // In a real implementation, this would use proper frustum intersection
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

    // Project points to screen space and check bounds
    const sourceScreenPos = sourceVector.clone().project(camera);
    const targetScreenPos = targetVector.clone().project(camera);

    const isSourceVisible = this.isPointInScreenBounds(sourceScreenPos);
    const isTargetVisible = this.isPointInScreenBounds(targetScreenPos);

    return isSourceVisible || isTargetVisible;
  }

  /**
   * Check if projected point is within screen bounds
   */
  private isPointInScreenBounds(point: Vector3): boolean {
    return (
      point.x >= -1.1 &&
      point.x <= 1.1 &&
      point.y >= -1.1 &&
      point.y <= 1.1 &&
      point.z >= -1 &&
      point.z <= 1
    );
  }

  /**
   * Create high-quality tube geometry
   */
  private createTubeGeometry(
    edge: InternalGraphEdge,
    lod: LODLevel,
    edgeSize: number
  ): BufferGeometry {
    const sourcePos = this.getNodePosition(edge.source);
    const targetPos = this.getNodePosition(edge.target);

    if (!sourcePos || !targetPos) {
      return new BufferGeometry();
    }

    // Create curve for the edge
    const curve = this.createEdgeCurve(edge, sourcePos, targetPos);

    return new TubeGeometry(
      curve,
      lod.segments,
      edgeSize / 2,
      lod.radialSegments,
      false
    );
  }

  /**
   * Create simplified line geometry for distant edges
   */
  private createLineGeometry(edge: InternalGraphEdge): BufferGeometry {
    const sourcePos = this.getNodePosition(edge.source);
    const targetPos = this.getNodePosition(edge.target);

    if (!sourcePos || !targetPos) {
      return new BufferGeometry();
    }

    const geometry = new BufferGeometry();
    const positions = new Float32Array([
      sourcePos.x,
      sourcePos.y,
      sourcePos.z || 0,
      targetPos.x,
      targetPos.y,
      targetPos.z || 0
    ]);

    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    return geometry;
  }

  /**
   * Create curve for edge (with potential curvature for aesthetics)
   */
  private createEdgeCurve(
    edge: InternalGraphEdge,
    sourcePos: { x: number; y: number; z?: number },
    targetPos: { x: number; y: number; z?: number }
  ): CatmullRomCurve3 {
    const start = new Vector3(sourcePos.x, sourcePos.y, sourcePos.z || 0);
    const end = new Vector3(targetPos.x, targetPos.y, targetPos.z || 0);

    // For now, create straight line
    // In future, could add curve based on edge properties
    const points = [start, end];

    // Add curve for self-loops or specific edge types
    if (edge.source === edge.target) {
      const midPoint = start.clone().add(end).multiplyScalar(0.5);
      midPoint.y += 20; // Create loop
      points.splice(1, 0, midPoint);
    }

    return new CatmullRomCurve3(points);
  }

  /**
   * Generate cache key for geometry
   */
  private getGeometryCacheKey(
    edge: InternalGraphEdge,
    lod: LODLevel,
    edgeSize: number
  ): string {
    return `${edge.id}_${lod.quality}_${lod.segments}_${lod.radialSegments}_${edgeSize.toFixed(1)}`;
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
   * Update LOD levels based on performance metrics
   */
  updateLODLevels(performanceMetrics: {
    frameRate: number;
    edgeCount: number;
    renderTime: number;
  }): void {
    if (!this.config.adaptiveQuality) return;

    const { frameRate, edgeCount, renderTime } = performanceMetrics;

    // Adjust LOD levels based on performance
    if (frameRate < 30 && edgeCount > 1000) {
      // Reduce quality for better performance
      this.lodLevels = this.lodLevels.map(level => ({
        ...level,
        segments: Math.max(2, Math.floor(level.segments * 0.8)),
        radialSegments: Math.max(3, Math.floor(level.radialSegments * 0.8)),
        distance: level.distance * 0.8 // Make high quality kick in closer
      }));
    } else if (frameRate > 55 && renderTime < 8) {
      // Increase quality when performance allows
      this.lodLevels = this.lodLevels.map(level => ({
        ...level,
        segments: Math.min(20, Math.floor(level.segments * 1.1)),
        radialSegments: Math.min(8, Math.floor(level.radialSegments * 1.1)),
        distance: level.distance * 1.1 // Make high quality kick in further
      }));
    }
  }

  /**
   * Get recommended batch size based on LOD level
   */
  getRecommendedBatchSize(lodLevel: LODLevel): number {
    switch (lodLevel.quality) {
    case 'high':
      return 500;
    case 'medium':
      return 1000;
    case 'low':
      return 2000;
    case 'minimal':
      return 5000;
    default:
      return 1000;
    }
  }

  /**
   * Clear geometry cache
   */
  clearCache(): void {
    this.geometryCache.forEach(geometry => geometry.dispose());
    this.geometryCache.clear();
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    this.clearCache();
  }
}
