// Imports
import { defineStore } from "pinia";
import { ref } from "vue";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

// Project imports
import { modelIndexedDB } from "@/utils/indexedDB";
import type { CachedModel, PreloadStatus } from "@/interfaces/cacheInterfaces";

export const useModelCacheStore = defineStore("modelCache", () => {
  // In-memory cache for parsed models (for current session)
  const memoryCache = new Map<string, CachedModel>();

  // Reactive state
  const preloadStatus = ref<Map<string, PreloadStatus>>(new Map());
  const cachedPaths = ref<string[]>([]);

  // Loader instance (reused across loads)
  let loader: GLTFLoader | null = null;

  // Initialize loader lazily
  function getLoader(): GLTFLoader {
    if (!loader) {
      const dracoLoader = new DRACOLoader();
      loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);
      loader.setMeshoptDecoder(MeshoptDecoder);
    }
    return loader;
  }

  // Load cached paths from IndexedDB on store initialization
  async function loadCachedPathsFromStorage(): Promise<void> {
    try {
      const paths = await modelIndexedDB.getAllPaths();
      cachedPaths.value = paths;
    } catch (error) {
      console.warn("Failed to load cached paths from IndexedDB:", error);
      cachedPaths.value = [];
    }
  }

  /**
   * Fetch model file as ArrayBuffer from network
   */
  async function fetchModelFile(
    modelPath: string,
    onProgress?: (progress: number) => void
  ): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", modelPath, true);
      xhr.responseType = "arraybuffer";

      xhr.onprogress = (event): void => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          onProgress?.(Math.round(progress));
        }
      };

      xhr.onload = (): void => {
        if (xhr.status === 200) {
          resolve(xhr.response as ArrayBuffer);
        } else {
          reject(new Error(`Failed to fetch model: ${xhr.status}`));
        }
      };

      xhr.onerror = (): void => {
        reject(new Error("Network error while fetching model"));
      };

      xhr.send();
    });
  }

  /**
   * Parse ArrayBuffer into GLTF model
   */
  async function parseModelData(
    data: ArrayBuffer,
    modelPath: string
  ): Promise<GLTF> {
    return new Promise((resolve, reject) => {
      const gltfLoader = getLoader();

      // Determine resource path for loading dependencies
      const resourcePath = modelPath.substring(
        0,
        modelPath.lastIndexOf("/") + 1
      );

      gltfLoader.parse(
        data,
        resourcePath,
        (gltf) => {
          resolve(gltf);
        },
        (error) => {
          const errorMessage =
            error instanceof Error ? error.message : JSON.stringify(error);
          reject(new Error(errorMessage));
        }
      );
    });
  }

  /**
   * Load model from IndexedDB cache
   */
  async function loadFromCache(
    modelPath: string,
    onProgress?: (progress: number) => void
  ): Promise<GLTF | null> {
    try {
      // Check memory cache first (fastest)
      const memoryCached = memoryCache.get(modelPath);
      if (memoryCached) {
        if (onProgress) {
          onProgress(100);
        }
        return {
          ...memoryCached.gltf,
          scene: memoryCached.gltf.scene.clone(true),
        };
      }

      // Loading from IndexedDB
      if (onProgress) {
        onProgress(10);
      }

      // Check IndexedDB cache
      const data = await modelIndexedDB.get(modelPath);
      if (!data) {
        return null;
      }

      if (onProgress) {
        onProgress(50);
      }

      // Parse the cached data
      const gltf = await parseModelData(data, modelPath);

      if (onProgress) {
        onProgress(80);
      }

      // Store in memory cache for faster subsequent access
      memoryCache.set(modelPath, {
        gltf,
        loadedAt: Date.now(),
      });

      if (onProgress) {
        onProgress(100);
      }

      // Return a clone
      return {
        ...gltf,
        scene: gltf.scene.clone(true),
      };
    } catch (error) {
      console.error("Error loading from cache:", error);
      return null;
    }
  }

  /**
   * Preload a model and store it in cache (both IndexedDB and memory)
   */
  async function preload(
    modelPath: string,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    // If already in memory cache, return immediately
    if (memoryCache.has(modelPath)) {
      onProgress?.(100);
      return;
    }

    // Check if already in IndexedDB
    const hasInDB = await modelIndexedDB.has(modelPath);
    if (hasInDB) {
      // Load from IndexedDB into memory
      await loadFromCache(modelPath);
      onProgress?.(100);
      return;
    }

    // If already preloading, wait for it
    const existing = preloadStatus.value.get(modelPath);
    if (existing?.isPreloading) {
      return;
    }

    // Mark as preloading
    preloadStatus.value.set(modelPath, {
      isPreloading: true,
      progress: 0,
    });

    try {
      // Fetch model file from network
      const data = await fetchModelFile(modelPath, (progress) => {
        const status = preloadStatus.value.get(modelPath);
        if (status) {
          status.progress = Math.round(progress * 0.8); // 80% for download
        }
        if (onProgress) {
          onProgress(Math.round(progress * 0.8));
        }
      });

      // Store in IndexedDB for persistence
      await modelIndexedDB.set(modelPath, data);

      // Update progress
      const status = preloadStatus.value.get(modelPath);
      if (status) {
        status.progress = 90;
      }
      if (onProgress) {
        onProgress(90);
      }

      // Parse the model
      const gltf = await parseModelData(data, modelPath);

      // Store in memory cache
      memoryCache.set(modelPath, {
        gltf,
        loadedAt: Date.now(),
      });

      // Update cached paths
      if (!cachedPaths.value.includes(modelPath)) {
        cachedPaths.value.push(modelPath);
      }

      // Update final progress
      const finalStatus = preloadStatus.value.get(modelPath);
      if (finalStatus) {
        finalStatus.isPreloading = false;
        finalStatus.progress = 100;
      }
      if (onProgress) {
        onProgress(100);
      }
    } catch (error) {
      // Remove from preload tracking on error
      preloadStatus.value.delete(modelPath);
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Get a cached model, returns a clone of the scene
   */
  async function get(
    modelPath: string,
    onProgress?: (progress: number) => void
  ): Promise<GLTF | null> {
    return await loadFromCache(modelPath, onProgress);
  }

  /**
   * Check if a model is cached (either in memory or IndexedDB)
   */
  async function has(modelPath: string): Promise<boolean> {
    // Check memory cache first
    if (memoryCache.has(modelPath)) {
      return true;
    }

    // Check IndexedDB
    try {
      return await modelIndexedDB.has(modelPath);
    } catch (error) {
      console.error("Error checking cache:", error);
      return false;
    }
  }

  /**
   * Check if a model is cached synchronously (memory only)
   */
  function hasSync(modelPath: string): boolean {
    return memoryCache.has(modelPath) || cachedPaths.value.includes(modelPath);
  }

  /**
   * Check if a model is currently preloading
   */
  function isPreloading(modelPath: string): boolean {
    return preloadStatus.value.get(modelPath)?.isPreloading ?? false;
  }

  /**
   * Get preload progress for a model (0-100)
   */
  function getPreloadProgress(modelPath: string): number {
    return preloadStatus.value.get(modelPath)?.progress ?? 0;
  }

  /**
   * Clear the cache (optional: by path or entire cache)
   */
  async function clear(modelPath?: string): Promise<void> {
    if (modelPath) {
      // Clear specific model
      const cached = memoryCache.get(modelPath);
      if (cached) {
        disposeModel(cached.gltf.scene);
        memoryCache.delete(modelPath);
      }

      preloadStatus.value.delete(modelPath);

      try {
        await modelIndexedDB.delete(modelPath);
      } catch (error) {
        console.error("Error deleting from IndexedDB:", error);
      }

      // Update cached paths
      cachedPaths.value = cachedPaths.value.filter(
        (path) => path !== modelPath
      );
    } else {
      // Clear entire cache
      memoryCache.forEach((cached) => {
        disposeModel(cached.gltf.scene);
      });
      memoryCache.clear();
      preloadStatus.value.clear();

      try {
        await modelIndexedDB.clear();
      } catch (error) {
        console.error("Error clearing IndexedDB:", error);
      }

      cachedPaths.value = [];
    }
  }

  /**
   * Get cache size (number of cached models)
   */
  function size(): number {
    return cachedPaths.value.length;
  }

  /**
   * Get all cached model paths
   */
  function getCachedPaths(): string[] {
    return [...cachedPaths.value];
  }

  /**
   * Get cache size in bytes
   */
  async function getCacheSize(): Promise<number> {
    try {
      return await modelIndexedDB.getCacheSize();
    } catch (error) {
      console.error("Error getting cache size:", error);
      return 0;
    }
  }

  /**
   * Dispose of a model's resources
   */
  function disposeModel(object: THREE.Object3D): void {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const geometry = child.geometry as THREE.BufferGeometry | undefined;
        if (geometry && typeof geometry.dispose === "function") {
          geometry.dispose();
        }

        const materials = Array.isArray(child.material)
          ? child.material
          : child.material
            ? [child.material]
            : [];

        materials.forEach((material: THREE.Material) => {
          if (typeof material.dispose === "function") {
            material.dispose();
          }
        });
      }
    });
  }

  // Initialize cached paths on store creation
  loadCachedPathsFromStorage().catch((error) => {
    console.error("Failed to initialize cached paths:", error);
  });

  return {
    // State
    cachedPaths,
    preloadStatus,

    // Actions
    preload,
    get,
    has,
    hasSync,
    isPreloading,
    getPreloadProgress,
    clear,
    size,
    getCachedPaths,
    getCacheSize,
  };
});
