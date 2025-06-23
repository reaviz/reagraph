// Simple worker manager for benchmark testing
// This creates real web workers that will appear in chrome://inspect/#workers

export interface PositionUpdate {
  id: string;
  x: number;
  y: number;
  z: number;
}

export interface WorkerManagerOptions {
  nodeCount: number;
  onPositionUpdate?: (positions: PositionUpdate[]) => void;
  onStatusChange?: (status: 'initializing' | 'enabled' | 'failed' | 'disabled') => void;
}

export class WorkerManager {
  private worker: Worker | null = null;
  private options: WorkerManagerOptions;
  private status: 'initializing' | 'enabled' | 'failed' | 'disabled' = 'disabled';

  constructor(options: WorkerManagerOptions) {
    this.options = options;
  }

  async initialize(): Promise<void> {
    try {
      this.updateStatus('initializing');
      
      // Create promise for initialization before creating worker
      const initPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Worker initialization timeout after 5 seconds'));
        }, 5000);

        // Create the worker
        this.worker = new Worker(
          new URL('../workers/benchmark.worker.ts', import.meta.url),
          { type: 'module' }
        );
        
        // Set up message handling with initialization check
        this.worker.onmessage = (event) => {
          if (event.data.type === 'initialized') {
            clearTimeout(timeout);
            this.updateStatus('enabled');
            console.log('[WorkerManager] Worker initialized successfully');
            resolve();
            
            // Set up regular message handling after initialization
            this.worker!.onmessage = (event) => {
              this.handleWorkerMessage(event.data);
            };
          } else if (event.data.type === 'error') {
            clearTimeout(timeout);
            this.updateStatus('failed');
            reject(new Error(event.data.payload?.error || 'Worker initialization failed'));
          }
        };
        
        this.worker.onerror = (error) => {
          clearTimeout(timeout);
          console.error('[WorkerManager] Worker error:', error);
          this.updateStatus('failed');
          reject(error);
        };
        
        // Initialize the worker
        console.log('[WorkerManager] Sending initialize message to worker...');
        this.worker.postMessage({
          type: 'initialize',
          payload: { nodeCount: this.options.nodeCount }
        });
      });
      
      // Wait for initialization
      await initPromise;
      
      // Start computation
      console.log('[WorkerManager] Starting worker computation...');
      this.worker!.postMessage({
        type: 'compute'
      });
      
    } catch (error) {
      console.error('[WorkerManager] Failed to initialize:', error);
      this.updateStatus('failed');
      throw error;
    }
  }


  private handleWorkerMessage(data: any) {
    switch (data.type) {
      case 'positions':
        if (this.options.onPositionUpdate) {
          this.options.onPositionUpdate(data.payload.positions);
        }
        break;
      case 'error':
        console.error('[WorkerManager] Worker error:', data.payload);
        this.updateStatus('failed');
        break;
      case 'disposed':
        this.updateStatus('disabled');
        break;
    }
  }

  private updateStatus(status: typeof this.status) {
    this.status = status;
    if (this.options.onStatusChange) {
      this.options.onStatusChange(status);
    }
  }

  getStatus(): typeof this.status {
    return this.status;
  }

  dispose(): void {
    if (this.worker) {
      this.worker.postMessage({ type: 'dispose' });
      this.worker.terminate();
      this.worker = null;
    }
    this.updateStatus('disabled');
  }
}