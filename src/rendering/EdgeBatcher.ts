import {
  BufferGeometry,
  InstancedMesh,
  Material,
  Matrix4,
  Vector3,
  TubeGeometry,
  CatmullRomCurve3,
  MeshBasicMaterial,
  ShaderMaterial,
  Color,
  Curve,
  BufferAttribute,
  Quaternion
} from 'three';
import { InternalGraphEdge } from '../types';

export interface BatchedEdgeGroups {
  [batchKey: string]: InstancedMesh;
}

export interface EdgeBatchConfig {
  maxEdgesPerBatch?: number;
  enableInstancing?: boolean;
  enableLOD?: boolean;
  lodThresholds?: number[];
  enableGPUCompute?: boolean;
  enableEdgeBundling?: boolean;
  bundlingThreshold?: number;
  enableViewportCulling?: boolean;
  segmentCounts?: number[];
  radialSegments?: number[];
}

export interface EdgeRenderState {
  color: number;
  opacity: number;
  size: number;
  style: 'solid' | 'dashed' | 'dotted';
  animated: boolean;
  highlighted: boolean;
}

export class EdgeBatcher {
  private geometryPool = new Map<string, BufferGeometry>();
  private materialPool = new Map<string, Material>();
  private instancedMeshes = new Map<string, InstancedMesh>();
  private config: EdgeBatchConfig;
  private edgeToBatchMap = new Map<string, string>();
  private renderStats = {
    totalEdges: 0,
    batchCount: 0,
    drawCalls: 0,
    geometryReuse: 0,
    culledEdges: 0
  };

  constructor(config: EdgeBatchConfig = {}) {
    this.config = {
      maxEdgesPerBatch: 1000,
      enableInstancing: true,
      enableLOD: true,
      lodThresholds: [100, 500, 1000],
      enableGPUCompute: false,
      enableEdgeBundling: false,
      bundlingThreshold: 5,
      enableViewportCulling: true,
      segmentCounts: [20, 10, 6, 2],
      radialSegments: [8, 6, 4, 3],
      ...config
    };
  }

  /**
   * Batch edges by visual properties for efficient rendering
   */
  batchEdges(edges: InternalGraphEdge[]): BatchedEdgeGroups {
    if (!this.config.enableInstancing || edges.length < 10) {
      // For small numbers of edges, instancing overhead isn't worth it
      return this.createIndividualEdges(edges);
    }

    const batches = new Map<string, InternalGraphEdge[]>();

    edges.forEach(edge => {
      const batchKey = this.getBatchKey(edge);
      if (!batches.has(batchKey)) {
        batches.set(batchKey, []);
      }
      batches.get(batchKey)!.push(edge);
    });

    return this.createInstancedMeshes(batches);
  }

  /**
   * Generate a batch key based on edge visual properties
   */
  private getBatchKey(edge: InternalGraphEdge): string {
    const state = this.getEdgeRenderState(edge);
    return `${state.color}_${state.size}_${state.style}_${state.animated ? 'anim' : 'static'}`;
  }

  /**
   * Determine render state for an edge
   */
  private getEdgeRenderState(edge: InternalGraphEdge): EdgeRenderState {
    // Default state - in production this would come from theme/props
    return {
      color: edge.data?.color || 0x666666,
      opacity: edge.data?.opacity || 1.0,
      size: edge.data?.size || 1.0,
      style: edge.data?.style || 'solid',
      animated: edge.data?.animated || false,
      highlighted: edge.data?.highlighted || false
    };
  }

  /**
   * Create instanced meshes for batched edges
   */
  private createInstancedMeshes(
    batches: Map<string, InternalGraphEdge[]>
  ): BatchedEdgeGroups {
    const instancedGroups: BatchedEdgeGroups = {};

    batches.forEach((edges, batchKey) => {
      if (edges.length === 0) return;

      // Split large batches
      const batchSize = this.config.maxEdgesPerBatch!;
      const numBatches = Math.ceil(edges.length / batchSize);

      for (let i = 0; i < numBatches; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, edges.length);
        const batchEdges = edges.slice(start, end);

        const batchId = numBatches > 1 ? `${batchKey}_${i}` : batchKey;
        const baseGeometry = this.getBaseEdgeGeometry();
        const material = this.getMaterial(batchKey);

        const instancedMesh = new InstancedMesh(
          baseGeometry,
          material,
          batchEdges.length
        );

        // Update instance matrices for each edge
        batchEdges.forEach((edge, index) => {
          const matrix = this.calculateEdgeMatrix(edge);
          instancedMesh.setMatrixAt(index, matrix);

          // Set per-instance colors if needed
          const state = this.getEdgeRenderState(edge);
          if (instancedMesh.instanceColor) {
            const color = new Color(state.color);
            instancedMesh.setColorAt(index, color);
          }
        });

        instancedMesh.instanceMatrix.needsUpdate = true;
        if (instancedMesh.instanceColor) {
          instancedMesh.instanceColor.needsUpdate = true;
        }

        instancedGroups[batchId] = instancedMesh;
      }
    });

    return instancedGroups;
  }

  /**
   * Create individual edge meshes for small numbers
   */
  private createIndividualEdges(edges: InternalGraphEdge[]): BatchedEdgeGroups {
    const groups: BatchedEdgeGroups = {};

    edges.forEach((edge, index) => {
      const geometry = this.createEdgeGeometry(edge);
      const material = this.getMaterial(this.getBatchKey(edge));

      // Create a single-instance mesh for compatibility
      const mesh = new InstancedMesh(geometry, material, 1);
      const matrix = this.calculateEdgeMatrix(edge);
      mesh.setMatrixAt(0, matrix);
      mesh.instanceMatrix.needsUpdate = true;

      groups[`individual_${edge.id}`] = mesh;
    });

    return groups;
  }

  /**
   * Get base geometry for edge rendering
   */
  private getBaseEdgeGeometry(): BufferGeometry {
    const cacheKey = 'base_edge';

    if (!this.geometryPool.has(cacheKey)) {
      // Create a simple tube geometry from 0,0,0 to 1,0,0
      const curve = new CatmullRomCurve3([
        new Vector3(0, 0, 0),
        new Vector3(1, 0, 0)
      ]);

      const geometry = new TubeGeometry(curve, 8, 0.5, 6, false);
      this.geometryPool.set(cacheKey, geometry);
    }

    return this.geometryPool.get(cacheKey)!;
  }

  /**
   * Create geometry specific to an edge
   */
  private createEdgeGeometry(edge: InternalGraphEdge): BufferGeometry {
    const sourcePos = this.getNodePosition(edge.source);
    const targetPos = this.getNodePosition(edge.target);

    if (!sourcePos || !targetPos) {
      return this.getBaseEdgeGeometry();
    }

    const curve = new CatmullRomCurve3([
      new Vector3(sourcePos.x, sourcePos.y, sourcePos.z || 0),
      new Vector3(targetPos.x, targetPos.y, targetPos.z || 0)
    ]);

    const state = this.getEdgeRenderState(edge);
    const segments = this.getLODSegments(edge, state.size);

    return new TubeGeometry(curve, segments, state.size / 2, 6, false);
  }

  /**
   * Calculate transformation matrix for edge instance
   */
  private calculateEdgeMatrix(edge: InternalGraphEdge): Matrix4 {
    const sourcePos = this.getNodePosition(edge.source);
    const targetPos = this.getNodePosition(edge.target);

    if (!sourcePos || !targetPos) {
      return new Matrix4().identity();
    }

    const start = new Vector3(sourcePos.x, sourcePos.y, sourcePos.z || 0);
    const end = new Vector3(targetPos.x, targetPos.y, targetPos.z || 0);
    const direction = end.clone().sub(start);
    const length = direction.length();

    if (length === 0) {
      return new Matrix4().identity();
    }

    direction.normalize();

    // Create transformation matrix
    const matrix = new Matrix4();

    // Position at start point
    matrix.setPosition(start);

    // Scale by edge length
    matrix.scale(new Vector3(length, 1, 1));

    // Rotate to face target
    if (Math.abs(direction.x) < 0.999) {
      const up = new Vector3(0, 1, 0);
      const right = new Vector3().crossVectors(direction, up).normalize();
      const actualUp = new Vector3().crossVectors(right, direction);

      matrix.makeBasis(direction, actualUp, right);
      matrix.setPosition(start);
      matrix.scale(new Vector3(length, 1, 1));
    }

    return matrix;
  }

  /**
   * Get material for batch
   */
  private getMaterial(batchKey: string): Material {
    if (!this.materialPool.has(batchKey)) {
      // Parse batch key to extract properties
      const [colorStr, sizeStr, style, animType] = batchKey.split('_');
      const color = parseInt(colorStr, 16) || 0x666666;

      const material = new MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.8
      });

      this.materialPool.set(batchKey, material);
    }

    return this.materialPool.get(batchKey)!;
  }

  /**
   * Get level-of-detail segments based on edge properties
   */
  private getLODSegments(edge: InternalGraphEdge, size: number): number {
    if (!this.config.enableLOD) {
      return 8; // Default segments
    }

    // Determine distance to camera (simplified)
    const distance = this.getEdgeDistanceToCamera(edge);

    if (distance > 1000) return 2;
    if (distance > 500) return 4;
    if (distance > 100) return 6;
    return 8;
  }

  /**
   * Get distance from edge to camera (simplified)
   */
  private getEdgeDistanceToCamera(edge: InternalGraphEdge): number {
    // In a real implementation, this would use the actual camera position
    // For now, return a placeholder based on edge position
    const sourcePos = this.getNodePosition(edge.source);
    const targetPos = this.getNodePosition(edge.target);

    if (!sourcePos || !targetPos) return 1000;

    const midpoint = new Vector3(
      (sourcePos.x + targetPos.x) / 2,
      (sourcePos.y + targetPos.y) / 2,
      ((sourcePos.z || 0) + (targetPos.z || 0)) / 2
    );

    return midpoint.length(); // Distance from origin
  }

  /**
   * Get node position (this would connect to the graph store)
   */
  private getNodePosition(
    nodeId: string
  ): { x: number; y: number; z?: number } | null {
    // In a real implementation, this would query the graph store
    // For now, return a placeholder
    return { x: 0, y: 0, z: 0 };
  }

  /**
   * Update positions for all batched edges
   */
  updatePositions(
    edgeUpdates: { edgeId: string; sourcePos: Vector3; targetPos: Vector3 }[]
  ): void {
    // Update instance matrices for position changes
    edgeUpdates.forEach(({ edgeId, sourcePos, targetPos }) => {
      // Find which batch contains this edge and update its matrix
      this.instancedMeshes.forEach((mesh, batchKey) => {
        // In a real implementation, maintain edge-to-instance mapping
        // For now, this is a placeholder for the update logic
      });
    });
  }

  /**
   * Advanced edge bundling for dense networks
   */
  bundleParallelEdges(edges: InternalGraphEdge[]): InternalGraphEdge[] {
    if (!this.config.enableEdgeBundling) {
      return edges;
    }

    const bundleGroups = new Map<string, InternalGraphEdge[]>();

    edges.forEach(edge => {
      const key = this.getEdgeGroupKey(edge.source, edge.target);
      if (!bundleGroups.has(key)) {
        bundleGroups.set(key, []);
      }
      bundleGroups.get(key)!.push(edge);
    });

    const bundledEdges: InternalGraphEdge[] = [];

    bundleGroups.forEach(groupEdges => {
      if (groupEdges.length >= this.config.bundlingThreshold!) {
        // Create bundled representation
        const bundledEdge = this.createEdgeBundle(groupEdges);
        bundledEdges.push(bundledEdge);
      } else {
        // Keep individual edges
        bundledEdges.push(...groupEdges);
      }
    });

    return bundledEdges;
  }

  /**
   * Generate edge group key for bundling
   */
  private getEdgeGroupKey(source: string, target: string): string {
    // Sort to ensure bidirectional edges are grouped together
    return source < target ? `${source}-${target}` : `${target}-${source}`;
  }

  /**
   * Create bundled edge representation
   */
  private createEdgeBundle(edges: InternalGraphEdge[]): InternalGraphEdge {
    const representative = edges[0];
    return {
      ...representative,
      id: `bundle_${edges.map(e => e.id).join('_')}`,
      data: {
        ...representative.data,
        bundleCount: edges.length,
        bundledEdges: edges,
        thickness: Math.log(edges.length + 1) * 2,
        opacity: Math.min(1, edges.length / 10)
      }
    };
  }

  /**
   * Viewport-based edge culling
   */
  cullEdgesByViewport(
    edges: InternalGraphEdge[],
    viewport: {
      x: number;
      y: number;
      width: number;
      height: number;
      z?: number;
    }
  ): InternalGraphEdge[] {
    if (!this.config.enableViewportCulling) {
      return edges;
    }

    const buffer = 100; // Buffer zone for smooth panning
    const visibleEdges = edges.filter(edge => {
      const sourcePos = this.getNodePosition(edge.source);
      const targetPos = this.getNodePosition(edge.target);

      if (!sourcePos || !targetPos) return false;

      // Quick AABB test - if both nodes outside viewport, cull edge
      const startInView = this.isPointInViewport(sourcePos, viewport, buffer);
      const endInView = this.isPointInViewport(targetPos, viewport, buffer);

      return startInView || endInView;
    });

    this.renderStats.culledEdges = edges.length - visibleEdges.length;
    return visibleEdges;
  }

  /**
   * Check if point is in viewport
   */
  private isPointInViewport(
    point: { x: number; y: number; z?: number },
    viewport: {
      x: number;
      y: number;
      width: number;
      height: number;
      z?: number;
    },
    buffer: number
  ): boolean {
    return (
      point.x >= viewport.x - buffer &&
      point.x <= viewport.x + viewport.width + buffer &&
      point.y >= viewport.y - buffer &&
      point.y <= viewport.y + viewport.height + buffer
    );
  }

  /**
   * Create advanced shader material for edges
   */
  private createAdvancedMaterial(batchKey: string): ShaderMaterial {
    const [colorStr, sizeStr, style, animType] = batchKey.split('_');
    const color = parseInt(colorStr, 16) || 0x666666;
    const animated = animType === 'anim';

    return new ShaderMaterial({
      vertexShader: this.getAdvancedVertexShader(animated),
      fragmentShader: this.getAdvancedFragmentShader(style),
      uniforms: {
        u_time: { value: 0.0 },
        u_color: { value: new Color(color) },
        u_opacity: { value: 1.0 },
        u_thickness: { value: parseFloat(sizeStr) || 1.0 },
        u_dashSize: { value: 0.1 },
        u_totalLength: { value: 1.0 }
      },
      transparent: true
    });
  }

  /**
   * Advanced vertex shader with animation support
   */
  private getAdvancedVertexShader(animated: boolean): string {
    return `
      uniform float u_time;
      attribute float instanceId;
      varying vec2 vUv;
      varying float vInstanceId;
      
      void main() {
        vUv = uv;
        vInstanceId = instanceId;
        
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        
        ${
  animated
    ? `
          // Flow animation along edge
          float animationPhase = u_time * 2.0 + vInstanceId * 0.1;
          float wave = sin(animationPhase + position.x * 10.0) * 0.05;
          worldPosition.y += wave;
        `
    : ''
}
        
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `;
  }

  /**
   * Advanced fragment shader with style support
   */
  private getAdvancedFragmentShader(style: string): string {
    return `
      uniform vec3 u_color;
      uniform float u_opacity;
      uniform float u_dashSize;
      uniform float u_totalLength;
      uniform float u_time;
      varying vec2 vUv;
      varying float vInstanceId;
      
      void main() {
        float alpha = u_opacity;
        
        ${
  style === 'dashed'
    ? `
          // Dashed pattern
          float dash = step(0.5, mod(vUv.x / u_dashSize, 2.0));
          alpha *= dash;
        `
    : ''
}
        
        ${
  style === 'dotted'
    ? `
          // Dotted pattern
          float dot = step(0.8, mod(vUv.x / u_dashSize * 4.0, 1.0));
          alpha *= dot;
        `
    : ''
}
        
        // Fade at edges for smooth appearance
        float edgeFade = 1.0 - pow(abs(vUv.y - 0.5) * 2.0, 2.0);
        alpha *= edgeFade;
        
        if (alpha < 0.01) discard;
        
        gl_FragColor = vec4(u_color, alpha);
      }
    `;
  }

  /**
   * Update animations for batched edges
   */
  updateAnimations(deltaTime: number): void {
    this.materialPool.forEach(material => {
      if (material instanceof ShaderMaterial && material.uniforms.u_time) {
        material.uniforms.u_time.value += deltaTime;
      }
    });
  }

  /**
   * Get comprehensive render statistics
   */
  getRenderStats(): typeof this.renderStats {
    this.renderStats.batchCount = this.instancedMeshes.size;
    this.renderStats.drawCalls = this.instancedMeshes.size;
    return { ...this.renderStats };
  }

  /**
   * Update edge in batch (for real-time updates)
   */
  updateEdgeInBatch(edgeId: string, newState: Partial<EdgeRenderState>): void {
    const batchKey = this.edgeToBatchMap.get(edgeId);
    if (!batchKey) return;

    // Mark batch as dirty for next render
    // In production, this would trigger selective updates
  }

  /**
   * Enable/disable GPU compute acceleration
   */
  setGPUComputeEnabled(enabled: boolean): void {
    this.config.enableGPUCompute = enabled;
    // Clear caches to force regeneration
    this.materialPool.clear();
    this.geometryPool.clear();
  }

  /**
   * Dispose of all geometries and materials
   */
  dispose(): void {
    this.geometryPool.forEach(geometry => geometry.dispose());
    this.materialPool.forEach(material => material.dispose());
    this.instancedMeshes.forEach(mesh => {
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(mat => mat.dispose());
      } else {
        mesh.material.dispose();
      }
    });

    this.geometryPool.clear();
    this.materialPool.clear();
    this.instancedMeshes.clear();
    this.edgeToBatchMap.clear();
  }
}
