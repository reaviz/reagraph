/**
 * Generic object pool for reducing garbage collection pressure
 * by reusing objects instead of creating new ones
 */
export class ObjectPool<T> {
  private available: T[] = [];
  private inUse = new Set<T>();
  private factory: () => T;
  private reset: (obj: T) => void;
  private validator?: (obj: T) => boolean;
  private maxSize: number;
  private totalCreated = 0;
  private peakUsage = 0;
  
  constructor(options: {
    factory: () => T;
    reset: (obj: T) => void;
    validator?: (obj: T) => boolean;
    initialSize?: number;
    maxSize?: number;
  }) {
    this.factory = options.factory;
    this.reset = options.reset;
    this.validator = options.validator;
    this.maxSize = options.maxSize || 10000;
    
    const initialSize = options.initialSize || 100;
    
    // Pre-allocate initial objects
    for (let i = 0; i < initialSize; i++) {
      const obj = this.factory();
      this.available.push(obj);
      this.totalCreated++;
    }
  }
  
  /**
   * Acquire an object from the pool
   */
  acquire(): T {
    let obj: T;
    
    // Try to get from available pool
    while (this.available.length > 0) {
      obj = this.available.pop()!;
      
      // Validate object if validator is provided
      if (!this.validator || this.validator(obj)) {
        this.inUse.add(obj);
        this.updatePeakUsage();
        return obj;
      }
      // Object failed validation, discard it
    }
    
    // No available objects, create new one
    obj = this.factory();
    this.totalCreated++;
    this.inUse.add(obj);
    this.updatePeakUsage();
    
    return obj;
  }
  
  /**
   * Release an object back to the pool
   */
  release(obj: T): void {
    if (!this.inUse.has(obj)) {
      // Only log warning in development or if debug flag is set
      if (process.env.NODE_ENV === 'development' || (globalThis as any).__REAGRAPH_DEBUG__) {
        console.warn('[ObjectPool] Attempting to release object not from this pool');
      }
      return;
    }
    
    this.inUse.delete(obj);
    
    try {
      this.reset(obj);
      
      // Only keep object if pool isn't full
      if (this.available.length < this.maxSize) {
        this.available.push(obj);
      }
      // Otherwise let it be garbage collected
    } catch (error) {
      console.error('[ObjectPool] Error resetting object:', error);
      // Don't add corrupted object back to pool
    }
  }
  
  /**
   * Release multiple objects at once
   */
  releaseMany(objects: T[]): void {
    for (const obj of objects) {
      this.release(obj);
    }
  }
  
  /**
   * Clear all objects from the pool
   */
  clear(): void {
    this.available = [];
    this.inUse.clear();
    this.totalCreated = 0;
    this.peakUsage = 0;
  }
  
  /**
   * Pre-warm the pool with additional objects
   */
  prewarm(count: number): void {
    const currentSize = this.available.length + this.inUse.size;
    const targetSize = Math.min(currentSize + count, this.maxSize);
    
    for (let i = currentSize; i < targetSize; i++) {
      const obj = this.factory();
      this.available.push(obj);
      this.totalCreated++;
    }
  }
  
  /**
   * Trim excess objects from the pool
   */
  trim(targetSize?: number): void {
    const target = targetSize ?? Math.max(this.inUse.size, 100);
    
    while (this.available.length > target) {
      this.available.pop();
    }
  }
  
  /**
   * Get pool statistics
   */
  getStats() {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size,
      totalCreated: this.totalCreated,
      peakUsage: this.peakUsage,
      hitRate: this.totalCreated > 0 
        ? (this.totalCreated - this.inUse.size) / this.totalCreated 
        : 0
    };
  }
  
  private updatePeakUsage(): void {
    this.peakUsage = Math.max(this.peakUsage, this.inUse.size);
  }
}

/**
 * Factory for creating typed object pools
 */
export class PoolFactory {
  private static pools = new Map<string, ObjectPool<any>>();
  
  static {
    // Register globally for performance tracking
    (globalThis as any).__REAGRAPH_POOL_FACTORY__ = PoolFactory;
  }
  
  static getPool<T>(
    name: string,
    options: {
      factory: () => T;
      reset: (obj: T) => void;
      validator?: (obj: T) => boolean;
      initialSize?: number;
      maxSize?: number;
    }
  ): ObjectPool<T> {
    if (!this.pools.has(name)) {
      this.pools.set(name, new ObjectPool<T>(options));
    }
    
    return this.pools.get(name)!;
  }
  
  static clearAll(): void {
    for (const pool of this.pools.values()) {
      pool.clear();
    }
    this.pools.clear();
  }
  
  static getStats() {
    const stats: Record<string, any> = {};
    
    for (const [name, pool] of this.pools.entries()) {
      stats[name] = pool.getStats();
    }
    
    return stats;
  }
}