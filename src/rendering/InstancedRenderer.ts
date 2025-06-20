/**
 * Phase 2B: GPU Instanced Rendering Architecture
 *
 * Implements InstancedMesh system for massive draw call reduction
 * Handles 50,000+ nodes in single draw calls with dynamic LOD
 */

import * as THREE from 'three';
import {
  AdvancedMemoryManager,
  NodeDataBuffer,
  EdgeDataBuffer
} from './MemoryManager';

export interface RenderConfig {
  maxInstancesPerBatch: number;
  enableLOD?: boolean;
  lodLevels?: LODLevel[];
  enableInstancing?: boolean;
  enableEdgeBundling?: boolean;
  enableTextureAtlas?: boolean;
}

export interface LODLevel {
  distance: number;
  geometry: THREE.BufferGeometry;
  complexity: number; // 0-1, where 1 is highest detail
}

export interface NodeInstanceData {
  position: THREE.Vector3;
  scale: THREE.Vector3;
  color: THREE.Color;
  opacity: number;
  visible: boolean;
}

export interface EdgeInstanceData {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: THREE.Color;
  opacity: number;
  thickness: number;
}

/**
 * Manages Level of Detail for nodes based on distance from camera
 */
export class LODManager {
  private lodLevels: LODLevel[];
  private geometryCache = new Map<number, THREE.BufferGeometry>();

  constructor(lodLevels?: LODLevel[]) {
    this.lodLevels = lodLevels || this.createDefaultLODLevels();
    this.initializeGeometries();
  }

  /**
   * Create default LOD levels with varying complexity
   */
  private createDefaultLODLevels(): LODLevel[] {
    return [
      {
        distance: 50,
        geometry: new THREE.SphereGeometry(1, 32, 24), // High detail
        complexity: 1.0
      },
      {
        distance: 100,
        geometry: new THREE.SphereGeometry(1, 16, 12), // Medium detail
        complexity: 0.7
      },
      {
        distance: 200,
        geometry: new THREE.SphereGeometry(1, 8, 6), // Low detail
        complexity: 0.5
      },
      {
        distance: 500,
        geometry: new THREE.SphereGeometry(1, 4, 3), // Very low detail
        complexity: 0.3
      },
      {
        distance: Infinity,
        geometry: new THREE.PlaneGeometry(2, 2), // Billboard for distant nodes
        complexity: 0.1
      }
    ];
  }

  /**
   * Initialize geometry cache
   */
  private initializeGeometries(): void {
    this.lodLevels.forEach((level, index) => {
      this.geometryCache.set(index, level.geometry);
    });
  }

  /**
   * Get appropriate LOD level based on distance
   */
  getLODLevel(distance: number): {
    level: number;
    geometry: THREE.BufferGeometry;
    complexity: number;
  } {
    for (let i = 0; i < this.lodLevels.length; i++) {
      if (distance <= this.lodLevels[i].distance) {
        return {
          level: i,
          geometry: this.lodLevels[i].geometry,
          complexity: this.lodLevels[i].complexity
        };
      }
    }

    // Return lowest detail level
    const lastLevel = this.lodLevels[this.lodLevels.length - 1];
    return {
      level: this.lodLevels.length - 1,
      geometry: lastLevel.geometry,
      complexity: lastLevel.complexity
    };
  }

  /**
   * Group nodes by LOD level
   */
  groupNodesByLOD(
    nodeBuffer: NodeDataBuffer,
    visibleNodes: number[],
    cameraPosition: THREE.Vector3
  ): Map<number, number[]> {
    const lodGroups = new Map<number, number[]>();

    for (const nodeIndex of visibleNodes) {
      const pos = nodeBuffer.getPosition(nodeIndex);
      const distance = cameraPosition.distanceTo(
        new THREE.Vector3(pos.x, pos.y, pos.z)
      );
      const lodInfo = this.getLODLevel(distance);

      if (!lodGroups.has(lodInfo.level)) {
        lodGroups.set(lodInfo.level, []);
      }
      lodGroups.get(lodInfo.level)!.push(nodeIndex);
    }

    return lodGroups;
  }

  /**
   * Dispose of geometries
   */
  dispose(): void {
    this.geometryCache.forEach(geometry => geometry.dispose());
    this.geometryCache.clear();
  }
}

/**
 * Manages texture atlases for efficient material rendering
 */
export class TextureAtlasManager {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private texture: THREE.Texture;
  private atlasSize: number;
  private tileSize: number;
  private tilesPerRow: number;
  private usedSlots = new Set<number>();
  private iconCache = new Map<
    string,
    { slot: number; uvOffset: THREE.Vector2; uvScale: THREE.Vector2 }
  >();

  constructor(atlasSize: number = 1024, tileSize: number = 64) {
    this.atlasSize = atlasSize;
    this.tileSize = tileSize;
    this.tilesPerRow = Math.floor(atlasSize / tileSize);

    this.canvas = document.createElement('canvas');
    this.canvas.width = atlasSize;
    this.canvas.height = atlasSize;
    this.context = this.canvas.getContext('2d')!;

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.generateMipmaps = false;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
  }

  /**
   * Add an icon to the atlas
   */
  addIcon(
    iconUrl: string,
    iconImage: HTMLImageElement
  ): { uvOffset: THREE.Vector2; uvScale: THREE.Vector2 } | null {
    if (this.iconCache.has(iconUrl)) {
      return this.iconCache.get(iconUrl)!;
    }

    // Find next available slot
    let slot = -1;
    for (let i = 0; i < this.tilesPerRow * this.tilesPerRow; i++) {
      if (!this.usedSlots.has(i)) {
        slot = i;
        break;
      }
    }

    if (slot === -1) {
      console.warn('Texture atlas is full');
      return null;
    }

    // Calculate position in atlas
    const x = (slot % this.tilesPerRow) * this.tileSize;
    const y = Math.floor(slot / this.tilesPerRow) * this.tileSize;

    // Draw icon to atlas
    this.context.drawImage(iconImage, x, y, this.tileSize, this.tileSize);
    this.texture.needsUpdate = true;

    // Calculate UV coordinates
    const uvOffset = new THREE.Vector2(x / this.atlasSize, y / this.atlasSize);
    const uvScale = new THREE.Vector2(
      this.tileSize / this.atlasSize,
      this.tileSize / this.atlasSize
    );

    const atlasData = { slot, uvOffset, uvScale };
    this.iconCache.set(iconUrl, atlasData);
    this.usedSlots.add(slot);

    return atlasData;
  }

  /**
   * Get the texture atlas
   */
  getTexture(): THREE.Texture {
    return this.texture;
  }

  /**
   * Get UV data for an icon
   */
  getIconUV(
    iconUrl: string
  ): { uvOffset: THREE.Vector2; uvScale: THREE.Vector2 } | null {
    return this.iconCache.get(iconUrl) || null;
  }

  /**
   * Clear the atlas
   */
  clear(): void {
    this.context.clearRect(0, 0, this.atlasSize, this.atlasSize);
    this.iconCache.clear();
    this.usedSlots.clear();
    this.texture.needsUpdate = true;
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.texture.dispose();
  }
}

/**
 * Manages instanced rendering for nodes
 */
export class NodeInstancedRenderer {
  private instancedMeshes = new Map<number, THREE.InstancedMesh>();
  private materials = new Map<number, THREE.Material>();
  private lodManager: LODManager;
  private textureAtlas: TextureAtlasManager;
  private scene: THREE.Scene;
  private config: RenderConfig;

  // Temporary arrays for instance data
  private matrixArray: Float32Array;
  private colorArray: Float32Array;
  private tempMatrix = new THREE.Matrix4();
  private tempColor = new THREE.Color();

  constructor(scene: THREE.Scene, config: RenderConfig) {
    this.scene = scene;
    this.config = config;
    this.lodManager = new LODManager(config.lodLevels);
    this.textureAtlas = new TextureAtlasManager();

    // Pre-allocate arrays for instance data
    this.matrixArray = new Float32Array(config.maxInstancesPerBatch * 16);
    this.colorArray = new Float32Array(config.maxInstancesPerBatch * 3);

    this.initializeInstancedMeshes();
  }

  /**
   * Initialize instanced meshes for each LOD level
   */
  private initializeInstancedMeshes(): void {
    this.lodManager['lodLevels'].forEach((lodLevel, index) => {
      // Create material for this LOD level
      const material = new THREE.MeshBasicMaterial({
        map: this.textureAtlas.getTexture(),
        transparent: true,
        alphaTest: 0.1
      });

      // Create instanced mesh
      const instancedMesh = new THREE.InstancedMesh(
        lodLevel.geometry.clone(),
        material,
        this.config.maxInstancesPerBatch
      );

      // Enable per-instance coloring
      instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(
        new Float32Array(this.config.maxInstancesPerBatch * 3),
        3
      );

      instancedMesh.count = 0; // Start with no instances
      this.scene.add(instancedMesh);

      this.instancedMeshes.set(index, instancedMesh);
      this.materials.set(index, material);
    });
  }

  /**
   * Update instanced rendering for visible nodes
   */
  updateInstances(
    nodeBuffer: NodeDataBuffer,
    visibleNodes: number[],
    cameraPosition: THREE.Vector3
  ): void {
    if (!this.config.enableInstancing) {
      return;
    }

    // Group nodes by LOD level
    const lodGroups = this.lodManager.groupNodesByLOD(
      nodeBuffer,
      visibleNodes,
      cameraPosition
    );

    // Update each LOD level
    lodGroups.forEach((nodeIndices, lodLevel) => {
      this.updateInstancesForLOD(lodLevel, nodeIndices, nodeBuffer);
    });

    // Reset unused LOD levels
    this.instancedMeshes.forEach((mesh, lodLevel) => {
      if (!lodGroups.has(lodLevel)) {
        mesh.count = 0;
      }
    });
  }

  /**
   * Update instances for a specific LOD level
   */
  private updateInstancesForLOD(
    lodLevel: number,
    nodeIndices: number[],
    nodeBuffer: NodeDataBuffer
  ): void {
    const instancedMesh = this.instancedMeshes.get(lodLevel);
    if (!instancedMesh) return;

    const instanceCount = Math.min(
      nodeIndices.length,
      this.config.maxInstancesPerBatch
    );
    instancedMesh.count = instanceCount;

    // Update instance matrices and colors
    for (let i = 0; i < instanceCount; i++) {
      const nodeIndex = nodeIndices[i];
      const pos = nodeBuffer.getPosition(nodeIndex);
      const size = nodeBuffer.sizes[nodeIndex];
      const colorHex = nodeBuffer.colors[nodeIndex];
      const opacity = nodeBuffer.opacities[nodeIndex];

      // Set position and scale
      this.tempMatrix.makeScale(size, size, size);
      this.tempMatrix.setPosition(pos.x, pos.y, pos.z);
      instancedMesh.setMatrixAt(i, this.tempMatrix);

      // Set color
      this.tempColor.setHex(colorHex);
      instancedMesh.setColorAt(i, this.tempColor);
    }

    // Mark for update
    instancedMesh.instanceMatrix.needsUpdate = true;
    if (instancedMesh.instanceColor) {
      instancedMesh.instanceColor.needsUpdate = true;
    }
  }

  /**
   * Add icon to texture atlas
   */
  addIconToAtlas(iconUrl: string, iconImage: HTMLImageElement): boolean {
    const result = this.textureAtlas.addIcon(iconUrl, iconImage);
    return result !== null;
  }

  /**
   * Get rendering statistics
   */
  getStats(): {
    lodLevels: number;
    totalInstances: number;
    drawCalls: number;
    memoryUsage: number;
    } {
    let totalInstances = 0;
    let drawCalls = 0;

    this.instancedMeshes.forEach(mesh => {
      if (mesh.count > 0) {
        totalInstances += mesh.count;
        drawCalls++; // Each mesh with instances is one draw call
      }
    });

    return {
      lodLevels: this.instancedMeshes.size,
      totalInstances,
      drawCalls,
      memoryUsage: this.matrixArray.byteLength + this.colorArray.byteLength
    };
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    this.instancedMeshes.forEach(mesh => {
      this.scene.remove(mesh);
      mesh.dispose();
    });
    this.materials.forEach(material => material.dispose());
    this.lodManager.dispose();
    this.textureAtlas.dispose();

    this.instancedMeshes.clear();
    this.materials.clear();
  }
}

/**
 * Manages instanced rendering for edges
 */
export class EdgeInstancedRenderer {
  private edgeGeometry: THREE.BufferGeometry;
  private edgeMaterial: THREE.LineBasicMaterial;
  private edgeInstancedMesh: THREE.InstancedMesh;
  private scene: THREE.Scene;
  private config: RenderConfig;

  // Edge bundling for dense networks
  private bundleThreshold: number = 100;
  private bundleGroups = new Map<string, number[]>();

  constructor(scene: THREE.Scene, config: RenderConfig) {
    this.scene = scene;
    this.config = config;

    this.initializeEdgeRendering();
  }

  /**
   * Initialize edge rendering system
   */
  private initializeEdgeRendering(): void {
    // Create line geometry for instanced edges
    this.edgeGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array([0, 0, 0, 1, 0, 0]); // Simple line from 0 to 1 on X axis
    this.edgeGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );

    // Create material
    this.edgeMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      vertexColors: true
    });

    // Create instanced mesh for edges
    this.edgeInstancedMesh = new THREE.InstancedMesh(
      this.edgeGeometry,
      this.edgeMaterial,
      this.config.maxInstancesPerBatch
    );

    this.edgeInstancedMesh.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(this.config.maxInstancesPerBatch * 3),
      3
    );

    this.edgeInstancedMesh.count = 0;
    this.scene.add(this.edgeInstancedMesh);
  }

  /**
   * Update edge instances
   */
  updateEdgeInstances(
    edgeBuffer: EdgeDataBuffer,
    nodeBuffer: NodeDataBuffer,
    visibleEdges: number[]
  ): void {
    if (!this.config.enableInstancing) {
      return;
    }

    const instanceCount = Math.min(
      visibleEdges.length,
      this.config.maxInstancesPerBatch
    );
    this.edgeInstancedMesh.count = instanceCount;

    // Process edge bundling if enabled
    const processedEdges = this.config.enableEdgeBundling
      ? this.bundleEdges(visibleEdges, nodeBuffer, edgeBuffer)
      : visibleEdges;

    // Update instance data
    for (let i = 0; i < Math.min(instanceCount, processedEdges.length); i++) {
      const edgeIndex = processedEdges[i];
      const endpoints = edgeBuffer.getEndpoints(edgeIndex);

      const sourcePos = nodeBuffer.getPosition(endpoints.source);
      const targetPos = nodeBuffer.getPosition(endpoints.target);

      // Calculate edge transformation matrix
      const start = new THREE.Vector3(sourcePos.x, sourcePos.y, sourcePos.z);
      const end = new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z);
      const direction = new THREE.Vector3().subVectors(end, start);
      const length = direction.length();

      direction.normalize();

      // Create transformation matrix
      const matrix = new THREE.Matrix4();
      matrix.lookAt(start, end, new THREE.Vector3(0, 1, 0));
      matrix.setPosition(start);
      matrix.scale(new THREE.Vector3(length, 1, 1));

      this.edgeInstancedMesh.setMatrixAt(i, matrix);

      // Set color
      const color = new THREE.Color(edgeBuffer.colors[edgeIndex]);
      this.edgeInstancedMesh.setColorAt(i, color);
    }

    // Mark for update
    this.edgeInstancedMesh.instanceMatrix.needsUpdate = true;
    if (this.edgeInstancedMesh.instanceColor) {
      this.edgeInstancedMesh.instanceColor.needsUpdate = true;
    }
  }

  /**
   * Bundle edges to reduce visual complexity in dense areas
   */
  private bundleEdges(
    edgeIndices: number[],
    nodeBuffer: NodeDataBuffer,
    edgeBuffer: EdgeDataBuffer
  ): number[] {
    if (edgeIndices.length < this.bundleThreshold) {
      return edgeIndices; // Not enough edges to benefit from bundling
    }

    // Simple bundling: group edges by approximate direction
    const bundles = new Map<string, number[]>();

    for (const edgeIndex of edgeIndices) {
      const endpoints = edgeBuffer.getEndpoints(edgeIndex);
      const sourcePos = nodeBuffer.getPosition(endpoints.source);
      const targetPos = nodeBuffer.getPosition(endpoints.target);

      // Create a direction key for bundling
      const dx = targetPos.x - sourcePos.x;
      const dy = targetPos.y - sourcePos.y;
      const angle = Math.atan2(dy, dx);
      const bundleKey = Math.round((angle * 8) / (2 * Math.PI)).toString(); // 8 direction buckets

      if (!bundles.has(bundleKey)) {
        bundles.set(bundleKey, []);
      }
      bundles.get(bundleKey)!.push(edgeIndex);
    }

    // Return representative edges from each bundle
    const bundledEdges: number[] = [];
    bundles.forEach(edgeGroup => {
      // Take every nth edge from dense bundles, all edges from sparse bundles
      const step = Math.max(1, Math.floor(edgeGroup.length / 10));
      for (let i = 0; i < edgeGroup.length; i += step) {
        bundledEdges.push(edgeGroup[i]);
      }
    });

    return bundledEdges;
  }

  /**
   * Get edge rendering statistics
   */
  getStats(): {
    totalEdges: number;
    bundledEdges: number;
    drawCalls: number;
    bundleGroups: number;
    } {
    return {
      totalEdges: this.edgeInstancedMesh.count,
      bundledEdges: this.bundleGroups.size,
      drawCalls: this.edgeInstancedMesh.count > 0 ? 1 : 0,
      bundleGroups: this.bundleGroups.size
    };
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.scene.remove(this.edgeInstancedMesh);
    this.edgeInstancedMesh.dispose();
    this.edgeGeometry.dispose();
    this.edgeMaterial.dispose();
    this.bundleGroups.clear();
  }
}

/**
 * Main instanced renderer coordinating all rendering optimizations
 */
export class AdvancedInstancedRenderer {
  private memoryManager: AdvancedMemoryManager;
  private nodeRenderer: NodeInstancedRenderer;
  private edgeRenderer: EdgeInstancedRenderer;
  private scene: THREE.Scene;
  private config: RenderConfig;

  private frameStats = {
    frameCount: 0,
    totalDrawCalls: 0,
    totalInstances: 0,
    averageDrawCalls: 0,
    averageInstances: 0
  };

  constructor(
    scene: THREE.Scene,
    memoryManager: AdvancedMemoryManager,
    config: RenderConfig
  ) {
    this.scene = scene;
    this.memoryManager = memoryManager;
    this.config = config;

    this.nodeRenderer = new NodeInstancedRenderer(scene, config);
    this.edgeRenderer = new EdgeInstancedRenderer(scene, config);
  }

  /**
   * Render frame with instanced rendering
   */
  render(camera: THREE.Camera): void {
    // Update visibility based on viewport culling
    const visibility = this.memoryManager.updateVisibility(camera);

    // Update node instances
    this.nodeRenderer.updateInstances(
      this.memoryManager.nodeBuffer,
      visibility.visibleNodes,
      camera.position
    );

    // Update edge instances
    this.edgeRenderer.updateEdgeInstances(
      this.memoryManager.edgeBuffer,
      this.memoryManager.nodeBuffer,
      visibility.visibleEdges
    );

    // Update frame statistics
    this.updateFrameStats(visibility);

    // Perform memory maintenance
    this.memoryManager.performMaintenance();
  }

  /**
   * Update frame statistics
   */
  private updateFrameStats(visibility: {
    visibleNodes: number[];
    visibleEdges: number[];
    culledCount: number;
  }): void {
    const nodeStats = this.nodeRenderer.getStats();
    const edgeStats = this.edgeRenderer.getStats();

    this.frameStats.frameCount++;
    this.frameStats.totalDrawCalls += nodeStats.drawCalls + edgeStats.drawCalls;
    this.frameStats.totalInstances +=
      nodeStats.totalInstances + edgeStats.totalEdges;

    // Calculate rolling averages
    this.frameStats.averageDrawCalls =
      this.frameStats.totalDrawCalls / this.frameStats.frameCount;
    this.frameStats.averageInstances =
      this.frameStats.totalInstances / this.frameStats.frameCount;
  }

  /**
   * Add icon to texture atlas
   */
  addIcon(iconUrl: string, iconImage: HTMLImageElement): boolean {
    return this.nodeRenderer.addIconToAtlas(iconUrl, iconImage);
  }

  /**
   * Get comprehensive rendering statistics
   */
  getRenderingStats(): {
    frameStats: typeof this.frameStats;
    nodeStats: ReturnType<NodeInstancedRenderer['getStats']>;
    edgeStats: ReturnType<EdgeInstancedRenderer['getStats']>;
    memoryStats: ReturnType<AdvancedMemoryManager['getMemoryStats']>;
    performanceMetrics: {
      drawCallReduction: number;
      memoryEfficiency: number;
      cullingEffectiveness: number;
    };
    } {
    const nodeStats = this.nodeRenderer.getStats();
    const edgeStats = this.edgeRenderer.getStats();
    const memoryStats = this.memoryManager.getMemoryStats();

    // Calculate performance metrics
    const totalElements =
      memoryStats.nodes.nodesCount + memoryStats.edges.edgesCount;
    const worstCaseDrawCalls = totalElements; // One draw call per element without instancing
    const actualDrawCalls = nodeStats.drawCalls + edgeStats.drawCalls;
    const drawCallReduction =
      ((worstCaseDrawCalls - actualDrawCalls) / worstCaseDrawCalls) * 100;

    const memoryEfficiency =
      (memoryStats.nodes.utilizationPercent +
        memoryStats.edges.utilizationPercent) /
      2;

    // This would need visibility data to calculate accurately
    const cullingEffectiveness = 0; // Placeholder

    return {
      frameStats: this.frameStats,
      nodeStats,
      edgeStats,
      memoryStats,
      performanceMetrics: {
        drawCallReduction,
        memoryEfficiency,
        cullingEffectiveness
      }
    };
  }

  /**
   * Reset frame statistics
   */
  resetStats(): void {
    this.frameStats = {
      frameCount: 0,
      totalDrawCalls: 0,
      totalInstances: 0,
      averageDrawCalls: 0,
      averageInstances: 0
    };
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    this.nodeRenderer.dispose();
    this.edgeRenderer.dispose();
    this.memoryManager.dispose();
  }
}
