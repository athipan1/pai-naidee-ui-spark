/**
 * Simple process lock implementation for Supabase auth
 * Prevents concurrent auth operations that could cause race conditions
 */

class ProcessLock {
  private locks: Set<string> = new Set();

  async acquireLock(key: string): Promise<() => void> {
    while (this.locks.has(key)) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    this.locks.add(key);
    
    return () => {
      this.locks.delete(key);
    };
  }
}

export const processLock = new ProcessLock();