/**
 * Storage abstraction layer for future database migration
 */

export interface IStorage {
  get<T>(key: string): T | null
  set<T>(key: string, value: T): void
  remove(key: string): void
  clear(): void
  keys(): string[]
}

/**
 * LocalStorage implementation
 */
export class LocalStorageAdapter implements IStorage {
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Error reading from localStorage: ${key}`, error)
      return null
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error writing to localStorage: ${key}`, error)
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing from localStorage: ${key}`, error)
    }
  }

  clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage', error)
    }
  }

  keys(): string[] {
    try {
      return Object.keys(localStorage)
    } catch (error) {
      console.error('Error getting localStorage keys', error)
      return []
    }
  }
}

// Singleton instance
export const storage: IStorage = new LocalStorageAdapter()
