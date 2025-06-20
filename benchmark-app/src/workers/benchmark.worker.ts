// Simple benchmark worker for testing web worker functionality
// This worker performs basic computations to simulate layout work

interface WorkerMessage {
  type: 'initialize' | 'compute' | 'dispose';
  payload?: any;
}

interface WorkerResponse {
  type: 'initialized' | 'positions' | 'disposed' | 'error';
  payload?: any;
}

let isRunning = false;
let computeInterval: ReturnType<typeof setInterval> | null = null;
let nodeCount = 0;

// Listen for messages from main thread
self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;
  
  try {
    switch (type) {
      case 'initialize':
        initialize(payload);
        break;
      case 'compute':
        startComputation(payload);
        break;
      case 'dispose':
        dispose();
        break;
      default:
        console.warn('[BenchmarkWorker] Unknown message type:', type);
    }
  } catch (error) {
    const response: WorkerResponse = {
      type: 'error',
      payload: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
    self.postMessage(response);
  }
});

function initialize(params: { nodeCount: number }) {
  nodeCount = params.nodeCount;
  console.log(`[BenchmarkWorker] Initialized with ${nodeCount} nodes`);
  
  const response: WorkerResponse = {
    type: 'initialized',
    payload: { nodeCount }
  };
  self.postMessage(response);
}

function startComputation(params?: any) {
  if (isRunning) return;
  
  isRunning = true;
  console.log('[BenchmarkWorker] Starting computation...');
  
  // Simulate layout computation with position updates
  computeInterval = setInterval(() => {
    // Generate fake position data to simulate real layout work
    const positions = [];
    for (let i = 0; i < nodeCount; i++) {
      positions.push({
        id: `node-${i}`,
        x: (Math.random() - 0.5) * 1000,
        y: (Math.random() - 0.5) * 1000,
        z: (Math.random() - 0.5) * 1000
      });
    }
    
    // Send position update to main thread
    const response: WorkerResponse = {
      type: 'positions',
      payload: { positions }
    };
    self.postMessage(response);
    
    // Perform some actual computation to consume CPU cycles
    performComputationWork();
    
  }, 100); // Update every 100ms
}

function performComputationWork() {
  // Simulate computational work that would happen in a real layout algorithm
  let sum = 0;
  const iterations = nodeCount * 10; // Scale work with node count
  
  for (let i = 0; i < iterations; i++) {
    sum += Math.sin(i) * Math.cos(i) * Math.sqrt(i + 1);
  }
  
  // This prevents the computation from being optimized away
  if (sum > Number.MAX_SAFE_INTEGER) {
    console.log('Computation overflow'); // Never reached, but prevents optimization
  }
}

function dispose() {
  isRunning = false;
  
  if (computeInterval !== null) {
    clearInterval(computeInterval);
    computeInterval = null;
  }
  
  console.log('[BenchmarkWorker] Disposed');
  
  const response: WorkerResponse = {
    type: 'disposed'
  };
  self.postMessage(response);
}

// Export to satisfy TypeScript
export {};