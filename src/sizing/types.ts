export interface SizingStrategy {
  ranks?: any;
  getSizeForNode: (id: string, size?: number) => number;
}
