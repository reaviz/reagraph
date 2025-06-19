export interface WorkerLoaderOptions {
  workerName: string;
  basePath?: string;
  debug?: boolean;
}

export interface WorkerLoadResult {
  worker: Worker | null;
  method: 'import-meta-url' | 'static-path' | 'blob-fallback' | 'failed';
  error?: Error;
}

export function detectBundlerEnvironment(): string {
  if (typeof window === 'undefined') return 'node';

  // @ts-ignore - Check for Webpack
  if (typeof __webpack_require__ !== 'undefined') return 'webpack';

  // Check for Vite
  if (typeof import.meta !== 'undefined' && 'env' in import.meta) return 'vite';

  // Check for Parcel
  // eslint-disable-next-line no-undef
  if (typeof process !== 'undefined' && process?.env?.PARCEL_BUNDLER)
    return 'parcel';

  // Check for Rollup
  if (typeof globalThis !== 'undefined' && 'rollup' in globalThis)
    return 'rollup';

  return 'unknown';
}

export function createFallbackWorkerCode(): string {
  // Simplified fallback worker for environments where dynamic loading fails
  return `
    import { expose } from 'comlink';
    
    class FallbackLayoutWorker {
      private isRunning = false;
      
      async initialize(nodeCount, onPositionUpdate) {
        console.log('[FallbackWorker] Initialized for', nodeCount, 'nodes');
        return Promise.resolve();
      }
      
      async simulate(nodes, edges, params) {
        console.log('[FallbackWorker] Simulating', nodes.length, 'nodes');
        // Basic main thread simulation fallback
        return Promise.resolve();
      }
      
      stop() {
        this.isRunning = false;
      }
    }
    
    expose(new FallbackLayoutWorker());
  `;
}

export async function createWorker(
  options: WorkerLoaderOptions
): Promise<WorkerLoadResult> {
  const { workerName, basePath = './workers', debug = false } = options;

  if (debug) {
    console.log(
      `[WorkerLoader] Loading worker "${workerName}" from "${basePath}"`
    );
    console.log(
      `[WorkerLoader] Detected environment: ${detectBundlerEnvironment()}`
    );
  }

  // Strategy 1: Modern import.meta.url (Webpack 5, Vite, modern bundlers)
  try {
    if (typeof import.meta?.url !== 'undefined') {
      const extensions = ['.js', '.mjs'];
      for (const ext of extensions) {
        try {
          const workerUrl = new URL(
            `${basePath}/${workerName}${ext}`,
            import.meta.url
          );
          if (debug) {
            console.log(
              `[WorkerLoader] Trying import.meta.url: ${workerUrl.href}`
            );
          }
          const worker = new Worker(workerUrl, { type: 'module' });
          if (debug) {
            console.log(
              '[WorkerLoader] Successfully loaded worker via import.meta.url'
            );
          }
          return { worker, method: 'import-meta-url' };
        } catch (error) {
          if (debug) {
            console.log(
              `[WorkerLoader] Failed to load ${workerName}${ext} via import.meta.url:`,
              error
            );
          }
        }
      }
    }
  } catch (error) {
    if (debug) {
      console.log('[WorkerLoader] import.meta.url strategy failed:', error);
    }
  }

  // Strategy 2: Static path loading (Parcel, legacy bundlers)
  try {
    const staticPaths = [
      `/workers/${workerName}.js`,
      `/workers/${workerName}.mjs`,
      `./workers/${workerName}.js`,
      `./workers/${workerName}.mjs`,
      `${basePath}/${workerName}.js`,
      `${basePath}/${workerName}.mjs`
    ];

    for (const path of staticPaths) {
      try {
        if (debug) {
          console.log(`[WorkerLoader] Trying static path: ${path}`);
        }
        const worker = new Worker(path, { type: 'module' });
        if (debug) {
          console.log(
            `[WorkerLoader] Successfully loaded worker via static path: ${path}`
          );
        }
        return { worker, method: 'static-path' };
      } catch (error) {
        if (debug) {
          console.log(`[WorkerLoader] Failed to load from ${path}:`, error);
        }
      }
    }
  } catch (error) {
    if (debug) {
      console.log('[WorkerLoader] Static path strategy failed:', error);
    }
  }

  // Strategy 3: Blob URL fallback (maximum compatibility)
  try {
    if (debug) {
      console.log('[WorkerLoader] Trying blob URL fallback');
    }
    const workerCode = createFallbackWorkerCode();
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    if (debug) {
      console.log(
        '[WorkerLoader] Successfully created fallback worker via blob URL'
      );
    }
    return { worker, method: 'blob-fallback' };
  } catch (error) {
    if (debug) {
      console.log('[WorkerLoader] Blob URL fallback failed:', error);
    }
  }

  // All strategies failed
  const errorMessage = `Failed to load worker "${workerName}" using all available strategies`;
  if (debug) {
    console.error(`[WorkerLoader] ${errorMessage}`);
  }
  return {
    worker: null,
    method: 'failed',
    error: new Error(errorMessage)
  };
}
