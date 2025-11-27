const DB_NAME = "ship3d-model-cache";
const DB_VERSION = 1;
const STORE_NAME = "models";

interface ModelData {
  path: string;
  data: ArrayBuffer;
  cachedAt: number;
  size: number;
}

/**
 * IndexedDB wrapper for caching 3D model files
 */
class ModelIndexedDB {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the IndexedDB database
   */
  private async init(): Promise<void> {
    if (this.db) return;

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (): void => {
        reject(new Error("Failed to open IndexedDB"));
      };

      request.onsuccess = (): void => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event): void => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, {
            keyPath: "path",
          });
          objectStore.createIndex("cachedAt", "cachedAt", { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Store a model file in IndexedDB
   */
  async set(path: string, data: ArrayBuffer): Promise<void> {
    await this.init();

    if (!this.db) {
      throw new Error("Database not initialized");
    }

    const modelData: ModelData = {
      path,
      data,
      cachedAt: Date.now(),
      size: data.byteLength,
    };

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(modelData);

      request.onsuccess = (): void => {
        resolve();
      };

      request.onerror = (): void => {
        reject(new Error(`Failed to store model: ${path}`));
      };
    });
  }

  /**
   * Retrieve a model file from IndexedDB
   */
  async get(path: string): Promise<ArrayBuffer | null> {
    await this.init();

    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(path);

      request.onsuccess = (): void => {
        const result = request.result as ModelData | undefined;
        resolve(result ? result.data : null);
      };

      request.onerror = (): void => {
        reject(new Error(`Failed to retrieve model: ${path}`));
      };
    });
  }

  /**
   * Check if a model exists in IndexedDB
   */
  async has(path: string): Promise<boolean> {
    await this.init();

    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(path);

      request.onsuccess = (): void => {
        resolve(request.result !== undefined);
      };

      request.onerror = (): void => {
        reject(new Error(`Failed to check model: ${path}`));
      };
    });
  }

  /**
   * Delete a model from IndexedDB
   */
  async delete(path: string): Promise<void> {
    await this.init();

    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(path);

      request.onsuccess = (): void => {
        resolve();
      };

      request.onerror = (): void => {
        reject(new Error(`Failed to delete model: ${path}`));
      };
    });
  }

  /**
   * Clear all models from IndexedDB
   */
  async clear(): Promise<void> {
    await this.init();

    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = (): void => {
        resolve();
      };

      request.onerror = (): void => {
        reject(new Error("Failed to clear model cache"));
      };
    });
  }

  /**
   * Get all cached model paths
   */
  async getAllPaths(): Promise<string[]> {
    await this.init();

    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAllKeys();

      request.onsuccess = (): void => {
        resolve(request.result as string[]);
      };

      request.onerror = (): void => {
        reject(new Error("Failed to get cached paths"));
      };
    });
  }

  /**
   * Get total cache size in bytes
   */
  async getCacheSize(): Promise<number> {
    await this.init();

    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = (): void => {
        const models = request.result as ModelData[];
        const totalSize = models.reduce((sum, model) => sum + model.size, 0);
        resolve(totalSize);
      };

      request.onerror = (): void => {
        reject(new Error("Failed to calculate cache size"));
      };
    });
  }

  /**
   * Get cache info for a specific model
   */
  async getInfo(path: string): Promise<Omit<ModelData, "data"> | null> {
    await this.init();

    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(path);

      request.onsuccess = (): void => {
        const result = request.result as ModelData | undefined;
        if (result) {
          const { data: _data, ...info } = result;
          resolve(info);
        } else {
          resolve(null);
        }
      };

      request.onerror = (): void => {
        reject(new Error(`Failed to get model info: ${path}`));
      };
    });
  }
}

// Singleton instance
export const modelIndexedDB = new ModelIndexedDB();
