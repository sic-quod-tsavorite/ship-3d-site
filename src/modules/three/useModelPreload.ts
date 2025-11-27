// Imports
import { computed } from "vue";
import type { ComputedRef } from "vue";

// Project imports
import { useModelCacheStore } from "@/stores/modelCache";

export interface UseModelPreloadReturn {
  preloadModel: (modelPath: string) => Promise<void>;
  isPreloading: (modelPath: string) => boolean;
  preloadProgress: (modelPath: string) => number;
  isCached: (modelPath: string) => boolean;
  isCachedAsync: (modelPath: string) => Promise<boolean>;
  cachedPaths: ComputedRef<string[]>;
  clearCache: (modelPath?: string) => Promise<void>;
  getCacheSize: () => Promise<number>;
  handleHover: (modelPath: string) => void;
}

/**
 * Composition function for preloading 3D models with caching
 * Uses Pinia store for centralized state management
 *
 * Includes a convenience handleHover method for hover-based preloading
 */
export function useModelPreload(): UseModelPreloadReturn {
  const modelCacheStore = useModelCacheStore();

  /**
   * Preload a model into the cache
   */
  const preloadModel = async (modelPath: string): Promise<void> => {
    // If already cached, no need to preload
    const isCachedAlready = await modelCacheStore.has(modelPath);
    if (isCachedAlready) {
      return;
    }

    // If already preloading, don't start again
    if (modelCacheStore.isPreloading(modelPath)) {
      return;
    }

    try {
      await modelCacheStore.preload(modelPath);
    } catch (error) {
      console.error("Error preloading model:", error);
      throw error;
    }
  };

  /**
   * Check if a model is currently preloading
   */
  const isPreloading = (modelPath: string): boolean => {
    return modelCacheStore.isPreloading(modelPath);
  };

  /**
   * Get preload progress for a model (0-100)
   */
  const preloadProgress = (modelPath: string): number => {
    return modelCacheStore.getPreloadProgress(modelPath);
  };

  /**
   * Check if a model is cached (synchronous - memory and paths only)
   */
  const isCached = (modelPath: string): boolean => {
    return modelCacheStore.hasSync(modelPath);
  };

  /**
   * Check if a model is cached (async - checks IndexedDB too)
   */
  const isCachedAsync = async (modelPath: string): Promise<boolean> => {
    return await modelCacheStore.has(modelPath);
  };

  /**
   * Get all cached model paths (reactive)
   */
  const cachedPaths = computed<string[]>(() => {
    return modelCacheStore.getCachedPaths();
  });

  /**
   * Clear the cache (optional: specific path or entire cache)
   */
  const clearCache = async (modelPath?: string): Promise<void> => {
    await modelCacheStore.clear(modelPath);
  };

  /**
   * Get total cache size in bytes
   */
  const getCacheSize = async (): Promise<number> => {
    return await modelCacheStore.getCacheSize();
  };

  /**
   * Convenience method for hover-based preloading
   * Only preloads if model is not already cached
   */
  const handleHover = (modelPath: string): void => {
    if (!isCached(modelPath)) {
      preloadModel(modelPath).catch((error) => {
        console.error("Failed to preload model:", error);
      });
    }
  };

  return {
    preloadModel,
    isPreloading,
    preloadProgress,
    isCached,
    isCachedAsync,
    cachedPaths,
    clearCache,
    getCacheSize,
    handleHover,
  };
}
