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
      
      // Create the worker
      this.worker = new Worker(
        new URL('../workers/benchmark.worker.ts', import.meta.url),
        { type: 'module' }
      );
      
      // Set up message handling
      this.worker.onmessage = (event) => {
        this.handleWorkerMessage(event.data);
      };
      
      this.worker.onerror = (error) => {
        console.error('[WorkerManager] Worker error:', error);
        this.updateStatus('failed');
      };
      
      // Initialize the worker
      this.worker.postMessage({
        type: 'initialize',
        payload: { nodeCount: this.options.nodeCount }
      });
      
      // Wait for initialization confirmation
      await this.waitForInitialization();
      
      // Start computation
      this.worker.postMessage({
        type: 'compute'
      });
      
    } catch (error) {
      console.error('[WorkerManager] Failed to initialize:', error);
      this.updateStatus('failed');
      throw error;
    }
  }

  private waitForInitialization(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Worker initialization timeout'));
      }, 5000);

      const originalOnMessage = this.worker?.onmessage;
      
      if (this.worker) {
        this.worker.onmessage = (event) => {
          if (event.data.type === 'initialized') {
            clearTimeout(timeout);
            this.updateStatus('enabled');
            console.log('[WorkerManager] Worker initialized successfully');
            
            // Restore original message handler
            if (this.worker && originalOnMessage) {
              this.worker.onmessage = originalOnMessage;
            }
            resolve();
          } else if (event.data.type === 'error') {
            clearTimeout(timeout);
            reject(new Error(event.data.payload?.error || 'Worker initialization failed'));
          }
        };
      }
    });
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