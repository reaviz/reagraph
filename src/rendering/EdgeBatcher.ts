import {
  BufferGeometry,
  InstancedMesh,
  Material,
  Matrix4,
  Vector3,
  TubeGeometry,
  CatmullRomCurve3,
  MeshBasicMaterial,
  Color
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

  constructor(config: EdgeBatchConfig = {}) {
    this.config = {
      maxEdgesPerBatch: 1000,
      enableInstancing: true,
      enableLOD: true,
      lodThresholds: [100, 500, 1000],
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
  }
}
