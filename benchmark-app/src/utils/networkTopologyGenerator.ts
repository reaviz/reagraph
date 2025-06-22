/**
 * Network Topology Generator - Creates realistic 8-level network hierarchies
 * 
 * Levels:
 * 0: Region (Geographic regions)
 * 1: DataCenter (Physical data centers)
 * 2: Zone (Availability zones)
 * 3: Rack (Server racks)
 * 4: Server (Physical servers)
 * 5: VM (Virtual machines)
 * 6: Container (Docker/K8s containers)
 * 7: Service (Application services)
 */

import { GraphData } from '../types/benchmark.types';

export interface NetworkNode {
  id: string;
  label: string;
  level: number;
  type: 'region' | 'datacenter' | 'zone' | 'rack' | 'server' | 'vm' | 'container' | 'service';
  status: 'active' | 'warning' | 'error' | 'maintenance';
  metrics?: {
    latency: number;
    throughput: number;
    errorRate: number;
    utilization: number;
  };
  parentId?: string;
  childIds: string[];
  // Visual properties
  color?: string;
  size?: number;
  icon?: string;
}

interface NetworkTopologyConfig {
  regions?: number;
  dataCentersPerRegion?: number;
  zonesPerDataCenter?: number;
  racksPerZone?: number;
  serversPerRack?: number;
  vmsPerServer?: number;
  containersPerVm?: number;
  servicesPerContainer?: number;
  crossConnections?: boolean;
  animatedTraffic?: boolean;
}

const LEVEL_CONFIGS = {
  0: { type: 'region', color: '#1a237e', size: 80, prefix: 'REG' },
  1: { type: 'datacenter', color: '#1976d2', size: 60, prefix: 'DC' },
  2: { type: 'zone', color: '#42a5f5', size: 50, prefix: 'AZ' },
  3: { type: 'rack', color: '#00897b', size: 40, prefix: 'RACK' },
  4: { type: 'server', color: '#43a047', size: 35, prefix: 'SRV' },
  5: { type: 'vm', color: '#7cb342', size: 30, prefix: 'VM' },
  6: { type: 'container', color: '#fdd835', size: 25, prefix: 'CTR' },
  7: { type: 'service', color: '#fb8c00', size: 20, prefix: 'SVC' }
} as const;

const STATUS_DISTRIBUTION = {
  active: 0.85,
  warning: 0.10,
  error: 0.03,
  maintenance: 0.02
};

export function generateNetworkTopology(config: NetworkTopologyConfig = {}): GraphData & {
  metadata: {
    totalLevels: number;
    nodeCountByLevel: number[];
    defaultCollapsedIds: string[];
  }
} {
  const {
    regions = 2,
    dataCentersPerRegion = 2,
    zonesPerDataCenter = 3,
    racksPerZone = 4,
    serversPerRack = 5,
    vmsPerServer = 3,
    containersPerVm = 4,
    servicesPerContainer = 2,
    crossConnections = true,
    animatedTraffic = true
  } = config;

  const nodes: NetworkNode[] = [];
  const edges: any[] = [];
  const nodeCountByLevel = new Array(8).fill(0);
  const defaultCollapsedIds: string[] = [];

  // Helper to generate node ID
  const generateNodeId = (level: number, indices: number[]) => {
    return indices.slice(0, level + 1).join('-');
  };

  // Helper to generate random status
  const getRandomStatus = (): NetworkNode['status'] => {
    const rand = Math.random();
    let cumulative = 0;
    for (const [status, probability] of Object.entries(STATUS_DISTRIBUTION)) {
      cumulative += probability;
      if (rand < cumulative) {
        return status as NetworkNode['status'];
      }
    }
    return 'active';
  };

  // Helper to generate metrics
  const generateMetrics = (level: number) => ({
    latency: Math.random() * (10 + level * 5) + 1,
    throughput: Math.random() * 1000 / (level + 1),
    errorRate: Math.random() * 0.05,
    utilization: Math.random() * 0.9 + 0.1
  });

  // Recursive function to create hierarchy
  const createNode = (
    level: number,
    parentId: string | undefined,
    indices: number[]
  ): NetworkNode => {
    const config = LEVEL_CONFIGS[level as keyof typeof LEVEL_CONFIGS];
    const nodeId = generateNodeId(level, indices);
    const label = `${config.prefix}-${indices[level]}`;
    
    const node: NetworkNode = {
      id: nodeId,
      label,
      level,
      type: config.type as NetworkNode['type'],
      status: getRandomStatus(),
      metrics: generateMetrics(level),
      parentId,
      childIds: [],
      color: config.color,
      size: config.size
    };

    nodes.push(node);
    nodeCountByLevel[level]++;

    // Create edge to parent
    if (parentId) {
      edges.push({
        id: `${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        size: Math.max(1, 6 - level),
        color: config.color,
        animated: animatedTraffic
      });
    }

    // Collapse nodes at level 4 and below by default
    if (level >= 3 && level < 7) {
      defaultCollapsedIds.push(nodeId);
    }

    return node;
  };

  // Build the hierarchy
  for (let r = 0; r < regions; r++) {
    const regionNode = createNode(0, undefined, [r]);
    
    for (let d = 0; d < dataCentersPerRegion; d++) {
      const dcNode = createNode(1, regionNode.id, [r, d]);
      regionNode.childIds.push(dcNode.id);
      
      for (let z = 0; z < zonesPerDataCenter; z++) {
        const zoneNode = createNode(2, dcNode.id, [r, d, z]);
        dcNode.childIds.push(zoneNode.id);
        
        for (let rk = 0; rk < racksPerZone; rk++) {
          const rackNode = createNode(3, zoneNode.id, [r, d, z, rk]);
          zoneNode.childIds.push(rackNode.id);
          
          for (let s = 0; s < serversPerRack; s++) {
            const serverNode = createNode(4, rackNode.id, [r, d, z, rk, s]);
            rackNode.childIds.push(serverNode.id);
            
            for (let v = 0; v < vmsPerServer; v++) {
              const vmNode = createNode(5, serverNode.id, [r, d, z, rk, s, v]);
              serverNode.childIds.push(vmNode.id);
              
              for (let c = 0; c < containersPerVm; c++) {
                const containerNode = createNode(6, vmNode.id, [r, d, z, rk, s, v, c]);
                vmNode.childIds.push(containerNode.id);
                
                for (let sv = 0; sv < servicesPerContainer; sv++) {
                  const serviceNode = createNode(7, containerNode.id, [r, d, z, rk, s, v, c, sv]);
                  containerNode.childIds.push(serviceNode.id);
                }
              }
            }
          }
        }
      }
    }
  }

  // Add cross-connections for network redundancy
  if (crossConnections) {
    // Connect data centers within same region
    const dcNodes = nodes.filter(n => n.level === 1);
    for (let i = 0; i < dcNodes.length - 1; i++) {
      if (dcNodes[i].parentId === dcNodes[i + 1].parentId) {
        edges.push({
          id: `cross-${dcNodes[i].id}-${dcNodes[i + 1].id}`,
          source: dcNodes[i].id,
          target: dcNodes[i + 1].id,
          size: 3,
          color: '#9c27b0',
          curved: true,
          animated: animatedTraffic,
          label: 'DC Link'
        });
      }
    }

    // Connect some services across containers for microservice communication
    const services = nodes.filter(n => n.level === 7);
    const numServiceConnections = Math.min(10, Math.floor(services.length * 0.1));
    for (let i = 0; i < numServiceConnections; i++) {
      const source = services[Math.floor(Math.random() * services.length)];
      const target = services[Math.floor(Math.random() * services.length)];
      if (source.id !== target.id && source.parentId !== target.parentId) {
        edges.push({
          id: `svc-${source.id}-${target.id}`,
          source: source.id,
          target: target.id,
          size: 1,
          color: '#ff5722',
          curved: true,
          animated: animatedTraffic,
          label: 'Service Mesh'
        });
      }
    }
  }

  // Convert to GraphData format
  const graphNodes = nodes.map(node => ({
    id: node.id,
    label: node.label,
    color: node.status === 'error' ? '#f44336' : 
           node.status === 'warning' ? '#ff9800' :
           node.status === 'maintenance' ? '#9e9e9e' :
           node.color,
    size: node.size,
    data: node
  }));

  return {
    nodes: graphNodes,
    edges,
    metadata: {
      totalLevels: 8,
      nodeCountByLevel,
      defaultCollapsedIds
    }
  };
}

// Generate different network topology scenarios
export function generateNetworkScenarios() {
  return {
    small: generateNetworkTopology({
      regions: 1,
      dataCentersPerRegion: 2,
      zonesPerDataCenter: 2,
      racksPerZone: 2,
      serversPerRack: 2,
      vmsPerServer: 2,
      containersPerVm: 2,
      servicesPerContainer: 2
    }),
    
    medium: generateNetworkTopology({
      regions: 2,
      dataCentersPerRegion: 2,
      zonesPerDataCenter: 3,
      racksPerZone: 3,
      serversPerRack: 4,
      vmsPerServer: 3,
      containersPerVm: 3,
      servicesPerContainer: 2
    }),
    
    large: generateNetworkTopology({
      regions: 3,
      dataCentersPerRegion: 3,
      zonesPerDataCenter: 3,
      racksPerZone: 4,
      serversPerRack: 5,
      vmsPerServer: 4,
      containersPerVm: 4,
      servicesPerContainer: 3
    }),
    
    enterprise: generateNetworkTopology({
      regions: 4,
      dataCentersPerRegion: 4,
      zonesPerDataCenter: 4,
      racksPerZone: 5,
      serversPerRack: 8,
      vmsPerServer: 6,
      containersPerVm: 5,
      servicesPerContainer: 4
    })
  };
}