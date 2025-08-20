// Debounced auto-save utility to prevent performance issues
// Prevents continuous saving operations that can overwhelm the system

export class DebouncedAutoSave {
  private static timeouts: Map<string, NodeJS.Timeout> = new Map();
  private static readonly DEFAULT_DELAY = 2000; // 2 seconds delay

  // Debounce function to prevent excessive save operations
  static debounce<T extends (...args: any[]) => void>(
    key: string,
    fn: T,
    delay: number = this.DEFAULT_DELAY
  ): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      // Clear existing timeout for this key
      const existingTimeout = this.timeouts.get(key);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set new timeout
      const newTimeout = setTimeout(() => {
        try {
          fn(...args);
          this.timeouts.delete(key);
        } catch (error) {
          console.error(`Error in debounced function ${key}:`, error);
          this.timeouts.delete(key);
        }
      }, delay);

      this.timeouts.set(key, newTimeout);
    };
  }

  // Immediate save (bypasses debounce) for critical operations
  static saveImmediately<T extends (...args: any[]) => void>(
    key: string,
    fn: T,
    ...args: Parameters<T>
  ): void {
    // Cancel any pending debounced save
    const existingTimeout = this.timeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.timeouts.delete(key);
    }

    try {
      fn(...args);
    } catch (error) {
      console.error(`Error in immediate save ${key}:`, error);
    }
  }

  // Clear all pending saves (useful for cleanup)
  static clearAll(): void {
    this.timeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.timeouts.clear();
    console.log('All debounced auto-saves cleared');
  }

  // Clear specific debounced save
  static clear(key: string): void {
    const timeout = this.timeouts.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(key);
      console.log(`Debounced auto-save cleared for: ${key}`);
    }
  }

  // Get pending save count (for debugging)
  static getPendingCount(): number {
    return this.timeouts.size;
  }
}

export default DebouncedAutoSave;
