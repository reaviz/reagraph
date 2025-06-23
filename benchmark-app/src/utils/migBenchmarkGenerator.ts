/**
 * Mig Benchmark Generator
 * Generates comprehensive benchmark tests for Mig's three-phase requirements
 */

import {
  GraphData,
  BenchmarkTest,
  GraphNode,
  GraphEdge
} from '../types/benchmark.types';

// Entity types for Mig use cases
export type MigEntityType =
  | 'Edge'
  | 'Application'
  | 'Data'
  | 'User'
  | 'Service'
  | 'Database'
  | 'API'
  | 'Network';

// Node colors and icons for different entity types
const ENTITY_CONFIG = {
  Edge: { color: '#3b82f6', icon: '🌐', category: 'infrastructure' },
  Application: { color: '#10b981', icon: '📱', category: 'application' },
  Data: { color: '#f59e0b', icon: '💾', category: 'data' },
  User: { color: '#8b5cf6', icon: '👤', category: 'identity' },
  Service: { color: '#06b6d4', icon: '⚙️', category: 'service' },
  Database: { color: '#f97316', icon: '🗄️', category: 'data' },
  API: { color: '#84cc16', icon: '🔌', category: 'service' },
  Network: { color: '#6366f1', icon: '🔗', category: 'infrastructure' }
};

interface MigNodeData {
  type: MigEntityType;
  category: string;
  importance: number;
  connections: number;
  zone?: 'edge' | 'application' | 'data';
  clusterId?: string;
  level?: number;
  isGateway?: boolean;
  metadata?: {
    [key: string]: any;
  };
}

interface MigGraphData extends GraphData {
  nodes: (GraphNode & { data: MigNodeData })[];
  edges: GraphEdge[];
}

/**
 * Generate Mig entity nodes with realistic properties
 */
function generateMigNodes(
  count: number,
  config: {
    typeDistribution?: Record<MigEntityType, number>;
    enableClustering?: boolean;
    enableHierarchy?: boolean;
    levels?: number;
  }
): (GraphNode & { data: MigNodeData })[] {
  const {
    typeDistribution = {
      Edge: 0.1,
      Application: 0.25,
      Data: 0.2,
      User: 0.15,
      Service: 0.15,
      Database: 0.05,
      API: 0.05,
      Network: 0.05
    },
    enableClustering = true,
    enableHierarchy = false,
    levels = 3
  } = config;

  const nodes: (GraphNode & { data: MigNodeData })[] = [];
  const typeCount: Record<MigEntityType, number> = {} as any;

  // Initialize type counts
  Object.keys(ENTITY_CONFIG).forEach(type => {
    typeCount[type as MigEntityType] = 0;
  });

  // Generate nodes
  for (let i = 0; i < count; i++) {
    // Determine node type based on distribution
    let accumulated = 0;
    let nodeType: MigEntityType = 'Application';
    const rand = Math.random();

    for (const [type, ratio] of Object.entries(typeDistribution)) {
      accumulated += ratio;
      if (rand < accumulated) {
        nodeType = type as MigEntityType;
        break;
      }
    }

    typeCount[nodeType]++;
    const config = ENTITY_CONFIG[nodeType];

    // Determine zone based on type
    let zone: 'edge' | 'application' | 'data' | undefined;
    if (['Edge', 'Network'].includes(nodeType)) zone = 'edge';
    else if (['Application', 'Service', 'API'].includes(nodeType))
      zone = 'application';
    else if (['Data', 'Database'].includes(nodeType)) zone = 'data';

    // Calculate importance (affects size)
    const importance = Math.random() * 0.7 + 0.3; // 0.3 to 1.0

    // Determine level for hierarchical layouts
    let level = 0;
    if (enableHierarchy) {
      if (nodeType === 'Edge') level = 0;
      else if (nodeType === 'Network') level = 1;
      else if (['Application', 'Service'].includes(nodeType)) level = 2;
      else if (nodeType === 'API') level = 3;
      else if (['Data', 'Database'].includes(nodeType)) level = 4;
      else if (nodeType === 'User') level = Math.floor(Math.random() * levels);
    }

    // Create cluster ID for grouping
    let clusterId: string | undefined;
    if (enableClustering) {
      // Group by zone and type
      clusterId = `${zone || 'general'}-${nodeType}-${Math.floor(typeCount[nodeType] / 5)}`;
    }

    // Determine if this is a gateway node (connects zones)
    const isGateway =
      Math.random() < 0.1 &&
      ['Application', 'Service', 'API'].includes(nodeType);

    nodes.push({
      id: `node-${i}`, // Use simple sequential IDs to avoid any mismatch issues
      label: `${config.icon} ${nodeType} ${typeCount[nodeType]}`,
      color: config.color,
      size: 10 + importance * 20, // Size based on importance
      // Add initial positions for force-directed layout
      x: (Math.random() - 0.5) * 1000,
      y: (Math.random() - 0.5) * 1000,
      z: (Math.random() - 0.5) * 100,
      data: {
        type: nodeType,
        category: config.category,
        importance,
        connections: 0, // Will be updated when edges are created
        zone,
        clusterId,
        level,
        isGateway,
        metadata: {
          created: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          lastActive: new Date(
            Date.now() - Math.random() * 24 * 60 * 60 * 1000
          ).toISOString(),
          version: `${Math.floor(Math.random() * 3 + 1)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 20)}`
        }
      }
    });
  }

  return nodes;
}

/**
 * Generate edges with Mig-specific patterns
 */
function generateMigEdges(
  nodes: (GraphNode & { data: MigNodeData })[],
  config: {
    edgeDensity?: number;
    enableBundling?: boolean;
    enableAnimatedFlows?: boolean;
    crossZoneRatio?: number;
  }
): GraphEdge[] {
  const {
    edgeDensity = 1.5,
    enableBundling = true,
    enableAnimatedFlows = true,
    crossZoneRatio = 0.2
  } = config;

  const edges: GraphEdge[] = [];
  const edgeCount = Math.floor(nodes.length * edgeDensity);
  const connectionCount: Record<string, number> = {};

  // Initialize connection counts
  nodes.forEach(node => {
    connectionCount[node.id] = 0;
  });

  // Group nodes by zone and type for realistic connections
  const nodesByZone: Record<string, typeof nodes> = {};
  const nodesByType: Record<MigEntityType, typeof nodes> = {} as any;
  const gatewayNodes = nodes.filter(n => n.data.isGateway);

  nodes.forEach(node => {
    const zone = node.data.zone || 'general';
    if (!nodesByZone[zone]) nodesByZone[zone] = [];
    nodesByZone[zone].push(node);

    if (!nodesByType[node.data.type]) nodesByType[node.data.type] = [];
    nodesByType[node.data.type].push(node);
  });

  // Create edges with realistic patterns
  for (let i = 0; i < edgeCount; i++) {
    let source: (typeof nodes)[0];
    let target: (typeof nodes)[0];
    let flowType: 'data' | 'control' | 'auth' = 'data';
    let style: 'solid' | 'dashed' | 'animated' = 'solid';

    // Determine if this should be a cross-zone connection
    const isCrossZone = Math.random() < crossZoneRatio;

    if (isCrossZone && gatewayNodes.length > 0) {
      // Cross-zone connections through gateways
      source = gatewayNodes[Math.floor(Math.random() * gatewayNodes.length)];
      const otherZones = Object.keys(nodesByZone).filter(
        z => z !== source.data.zone
      );
      if (otherZones.length > 0) {
        const targetZone =
          otherZones[Math.floor(Math.random() * otherZones.length)];
        const targetNodes = nodesByZone[targetZone];
        target = targetNodes[Math.floor(Math.random() * targetNodes.length)];
        flowType = 'control';
        style = 'dashed';
      } else {
        target = nodes[Math.floor(Math.random() * nodes.length)];
      }
    } else {
      // Same-zone connections or type-based connections
      source = nodes[Math.floor(Math.random() * nodes.length)];

      // Prefer connections within same zone or between related types
      const sameZoneNodes = nodesByZone[source.data.zone || 'general'];
      const relatedTypes = getRelatedTypes(source.data.type);
      const relatedNodes = nodes.filter(
        n =>
          relatedTypes.includes(n.data.type) || n.data.zone === source.data.zone
      );

      if (relatedNodes.length > 0 && Math.random() < 0.8) {
        target = relatedNodes[Math.floor(Math.random() * relatedNodes.length)];
      } else {
        target = nodes[Math.floor(Math.random() * nodes.length)];
      }

      // Determine flow type based on connection
      if (source.data.type === 'User' || target.data.type === 'User') {
        flowType = 'auth';
      } else if (
        source.data.type === 'Data' ||
        target.data.type === 'Data' ||
        source.data.type === 'Database' ||
        target.data.type === 'Database'
      ) {
        flowType = 'data';
      } else {
        flowType = 'control';
      }

      // Animated flows for important connections
      if (
        enableAnimatedFlows &&
        (source.data.importance > 0.7 || target.data.importance > 0.7) &&
        Math.random() < 0.3
      ) {
        style = 'animated';
      }
    }

    // Avoid self-loops
    if (source.id === target.id) continue;

    // Update connection counts
    connectionCount[source.id]++;
    connectionCount[target.id]++;

    // Create bundle ID for edge aggregation
    let bundleId: string | undefined;
    if (enableBundling) {
      // Bundle edges between same clusters or types
      const sourceCluster = source.data.clusterId || source.data.type;
      const targetCluster = target.data.clusterId || target.data.type;
      bundleId = [sourceCluster, targetCluster].sort().join('-');
    }

    edges.push({
      id: `edge-${i}`,
      source: source.id,
      target: target.id,
      label: `${flowType}-flow`,
      size: flowType === 'data' ? 3 : 2,
      curved: true,
      animated: style === 'animated',
      color:
        flowType === 'data'
          ? '#3b82f6'
          : flowType === 'auth'
            ? '#f59e0b'
            : '#10b981',
      // Extended properties stored in the edge object but not used by GraphEdge interface
      style,
      bundleId,
      flowType
    } as GraphEdge & { style?: string; bundleId?: string; flowType?: string });
  }

  // Update node connection counts
  nodes.forEach(node => {
    node.data.connections = connectionCount[node.id] || 0;
    // Update size based on connections (degree centrality)
    node.size = (node.size || 10) + Math.min(connectionCount[node.id] * 2, 20);
  });

  return edges;
}

/**
 * Get related entity types for realistic connections
 */
function getRelatedTypes(type: MigEntityType): MigEntityType[] {
  const relations: Record<MigEntityType, MigEntityType[]> = {
    Edge: ['Network', 'Application'],
    Application: ['Service', 'API', 'Data', 'User'],
    Data: ['Database', 'Application', 'Service'],
    User: ['Application', 'Service'],
    Service: ['API', 'Database', 'Application'],
    Database: ['Data', 'Service', 'Application'],
    API: ['Service', 'Application', 'User'],
    Network: ['Edge', 'Application', 'Service']
  };

  return relations[type] || [];
}

/**
 * Generate Mig benchmark scenarios
 */
export function generateMigBenchmarkScenarios(): Record<string, MigGraphData> {
  return {
    // Phase 1: Baseline features - small scale
    phase1Small: generateMigScenario({
      nodeCount: 100,
      edgeDensity: 1.2,
      enableClustering: true,
      enableHierarchy: false,
      enableBundling: false,
      enableAnimatedFlows: false
    }),

    // Phase 1: Baseline features - medium scale
    phase1Medium: generateMigScenario({
      nodeCount: 500,
      edgeDensity: 1.5,
      enableClustering: true,
      enableHierarchy: false,
      enableBundling: false,
      enableAnimatedFlows: true
    }),

    // Phase 2: Advanced features - medium scale
    phase2Medium: generateMigScenario({
      nodeCount: 1000,
      edgeDensity: 1,
      enableClustering: true,
      enableHierarchy: true,
      enableBundling: true,
      enableAnimatedFlows: true,
      crossZoneRatio: 0.3
    }),

    // Phase 2: Advanced features - large scale
    phase2Large: generateMigScenario({
      nodeCount: 2500,
      edgeDensity: 1.5,
      enableClustering: true,
      enableHierarchy: true,
      enableBundling: true,
      enableAnimatedFlows: true,
      crossZoneRatio: 0.25
    }),

    // Phase 3: Complex features - large scale
    phase3Large: generateMigScenario({
      nodeCount: 5000,
      edgeDensity: 1.2,
      enableClustering: true,
      enableHierarchy: true,
      enableBundling: true,
      enableAnimatedFlows: true,
      levels: 5,
      crossZoneRatio: 0.2
    }),

    // Phase 3: Complex features - extreme scale
    phase3Extreme: generateMigScenario({
      nodeCount: 10000,
      edgeDensity: 0.8,
      enableClustering: true,
      enableHierarchy: true,
      enableBundling: true,
      enableAnimatedFlows: false, // Disable for performance
      levels: 7,
      crossZoneRatio: 0.15
    })
  };
}

/**
 * Generate a single Mig scenario
 */
function generateMigScenario(config: {
  nodeCount: number;
  edgeDensity?: number;
  enableClustering?: boolean;
  enableHierarchy?: boolean;
  enableBundling?: boolean;
  enableAnimatedFlows?: boolean;
  levels?: number;
  crossZoneRatio?: number;
}): MigGraphData {
  const nodes = generateMigNodes(config.nodeCount, {
    enableClustering: config.enableClustering,
    enableHierarchy: config.enableHierarchy,
    levels: config.levels
  });

  const edges = generateMigEdges(nodes, {
    edgeDensity: config.edgeDensity,
    enableBundling: config.enableBundling,
    enableAnimatedFlows: config.enableAnimatedFlows,
    crossZoneRatio: config.crossZoneRatio
  });

  // Calculate metadata
  const nodesByLevel: Record<number, number> = {};
  const clusterIds = new Set<string>();
  let gatewayCount = 0;

  nodes.forEach(node => {
    if (node.data.level !== undefined) {
      nodesByLevel[node.data.level] = (nodesByLevel[node.data.level] || 0) + 1;
    }
    if (node.data.clusterId) {
      clusterIds.add(node.data.clusterId);
    }
    if (node.data.isGateway) {
      gatewayCount++;
    }
  });

  // Identify nodes to collapse by default (some clusters)
  const defaultCollapsedIds: string[] = [];
  if (config.enableClustering && clusterIds.size > 5) {
    // Collapse some cluster representatives
    const clusterReps = Array.from(clusterIds).slice(
      0,
      Math.floor(clusterIds.size / 3)
    );
    nodes.forEach(node => {
      if (
        clusterReps.includes(node.data.clusterId || '') &&
        Math.random() < 0.3
      ) {
        defaultCollapsedIds.push(node.id);
      }
    });
  }

  return {
    nodes,
    edges,
    metadata: {
      totalLevels: Object.keys(nodesByLevel).length,
      nodeCountByLevel: Object.values(nodesByLevel),
      defaultCollapsedIds,
      clusterCount: clusterIds.size,
      gatewayCount,
      zoneDistribution: {
        edge: nodes.filter(n => n.data.zone === 'edge').length,
        application: nodes.filter(n => n.data.zone === 'application').length,
        data: nodes.filter(n => n.data.zone === 'data').length
      }
    }
  };
}

/**
 * Create Mig benchmark tests
 */
export function createMigBenchmarkTests(): BenchmarkTest[] {
  const scenarios = generateMigBenchmarkScenarios();

  return [
    // Phase 1: Baseline Features
    {
      id: 'mig-phase1-small',
      name: 'Mig Phase 1 - Small (100 nodes)',
      description:
        'Baseline features: selection, node types, borders, transitions, sizing, clustering',
      nodeCount: scenarios.phase1Small.nodes.length,
      edgeCount: scenarios.phase1Small.edges.length,
      category: 'small',
      dataset: scenarios.phase1Small,
      layoutType: 'forceDirected2d',
      edgeInterpolation: 'curved'
    },
    {
      id: 'mig-phase1-medium',
      name: 'Mig Phase 1 - Medium (500 nodes)',
      description: 'Baseline features at medium scale with animations',
      nodeCount: scenarios.phase1Medium.nodes.length,
      edgeCount: scenarios.phase1Medium.edges.length,
      category: 'medium',
      dataset: scenarios.phase1Medium,
      layoutType: 'forceDirected2d',
      edgeInterpolation: 'curved',
      animated: true
    },

    // Phase 2: Advanced Features
    {
      id: 'mig-phase2-medium',
      name: 'Mig Phase 2 - Medium (1,000 nodes)',
      description:
        'Advanced features: custom edges, aggregation, contextual boundaries',
      nodeCount: scenarios.phase2Medium.nodes.length,
      edgeCount: scenarios.phase2Medium.edges.length,
      category: 'large',
      dataset: scenarios.phase2Medium,
      layoutType: 'hierarchicalTd',
      edgeInterpolation: 'curved',
      animated: true,
      interactive: true
    },
    {
      id: 'mig-phase2-large',
      name: 'Mig Phase 2 - Large (2,500 nodes)',
      description: 'Advanced features at scale with edge bundling',
      nodeCount: scenarios.phase2Large.nodes.length,
      edgeCount: scenarios.phase2Large.edges.length,
      category: 'massive',
      dataset: scenarios.phase2Large,
      layoutType: 'forceInABox',
      edgeInterpolation: 'curved',
      animated: true,
      interactive: true
    },

    // Phase 3: Complex Features
    {
      id: 'mig-phase3-large',
      name: 'Mig Phase 3 - Large (5,000 nodes)',
      description:
        'Complex features: perimeters, hierarchical grouping, orphan management, dynamic visibility',
      nodeCount: scenarios.phase3Large.nodes.length,
      edgeCount: scenarios.phase3Large.edges.length,
      category: 'massive',
      dataset: scenarios.phase3Large,
      layoutType: 'hierarchicalTd',
      edgeInterpolation: 'curved',
      animated: true,
      interactive: true,
      initialCollapsedNodeIds:
        scenarios.phase3Large.metadata?.defaultCollapsedIds
    },
    {
      id: 'mig-phase3-extreme',
      name: 'Mig Phase 3 - Extreme (10,000 nodes)',
      description: 'Maximum scale test: 10K+ nodes with all optimizations',
      nodeCount: scenarios.phase3Extreme.nodes.length,
      edgeCount: scenarios.phase3Extreme.edges.length,
      category: 'extreme',
      dataset: scenarios.phase3Extreme,
      layoutType: 'hierarchicalTd',
      edgeInterpolation: 'curved',
      interactive: true,
      initialCollapsedNodeIds:
        scenarios.phase3Extreme.metadata?.defaultCollapsedIds
    }
  ];
}
