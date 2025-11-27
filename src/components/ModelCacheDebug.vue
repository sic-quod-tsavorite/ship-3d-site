<template>
  <div
    v-if="isDev"
    class="fixed bottom-4 right-4 z-9999 max-w-sm rounded-lg border border-slate-300 bg-white/95 p-4 shadow-lg backdrop-blur-sm"
  >
    <div class="mb-3 flex items-center justify-between">
      <h3 class="text-sm font-semibold text-slate-900">Model Cache Debug</h3>
      <button
        @click="isExpanded = !isExpanded"
        class="rounded ml-3 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
      >
        {{ isExpanded ? "−" : "+" }}
      </button>
    </div>

    <div v-if="isExpanded" class="space-y-3">
      <!-- Cache Stats -->
      <div class="space-y-1 text-xs">
        <div class="flex justify-between">
          <span class="text-slate-600">Cached Models:</span>
          <span class="font-medium text-slate-900">{{ cachedCount }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-600">Cache Size:</span>
          <span class="font-medium text-slate-900">
            {{ cacheSizeFormatted }}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-600">In Memory:</span>
          <span class="font-medium text-slate-900">{{ memoryCount }}</span>
        </div>
      </div>

      <!-- Cached Paths List -->
      <div v-if="cachedPaths.length > 0" class="space-y-1">
        <div class="text-xs font-medium text-slate-700">Cached Paths:</div>
        <div class="max-h-32 space-y-1 overflow-y-auto text-xs">
          <div
            v-for="path in cachedPaths"
            :key="path"
            class="flex items-center justify-between rounded bg-slate-50 px-2 py-1"
          >
            <span class="truncate text-slate-600" :title="path">
              {{ getFileName(path) }}
            </span>
            <button
              @click="clearModel(path)"
              class="ml-2 text-red-600 hover:text-red-800"
              title="Clear this model"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <!-- Preload Status -->
      <div v-if="hasActivePreloads" class="space-y-1">
        <div class="text-xs font-medium text-slate-700">Active Preloads:</div>
        <div class="space-y-1 text-xs">
          <div
            v-for="(status, path) in activePreloads"
            :key="path"
            class="rounded bg-blue-50 px-2 py-1"
          >
            <div class="flex justify-between">
              <span class="truncate text-slate-600">
                {{ getFileName(String(path)) }}
              </span>
              <span class="font-medium text-blue-700">
                {{ status.progress }}%
              </span>
            </div>
            <div
              class="mt-1 h-1 w-full overflow-hidden rounded-full bg-blue-200"
            >
              <div
                class="h-full bg-blue-600 transition-all duration-300"
                :style="{ width: status.progress + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-2">
        <button
          @click="refreshStats"
          class="flex-1 rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
        >
          Refresh
        </button>
        <button
          @click="clearAllCache"
          class="flex-1 rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
        >
          Clear All
        </button>
      </div>

      <!-- Test Actions -->
      <div class="border-t border-slate-200 pt-3">
        <div class="mb-2 text-xs font-medium text-slate-700">Test Actions:</div>
        <div class="flex gap-2">
          <button
            @click="testPreload"
            class="flex-1 rounded bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
          >
            Test Preload
          </button>
          <button
            @click="checkIndexedDB"
            class="flex-1 rounded bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700"
          >
            Check IDB
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Imports
import { ref, computed, onMounted, onUnmounted } from "vue";

// Project imports
import { useModelPreload } from "../modules/three/useModelPreload";
import { useModelCacheStore } from "../stores/modelCache";

const isDev = import.meta.env.DEV;
const isExpanded = ref(true);

const modelCacheStore = useModelCacheStore();
const { cachedPaths, clearCache, getCacheSize } = useModelPreload();

// Stats
const cachedCount = computed(() => cachedPaths.value.length);
const cacheSize = ref(0);
const memoryCount = ref(0);

const cacheSizeFormatted = computed(() => {
  if (cacheSize.value === 0) return "0 KB";
  const kb = cacheSize.value / 1024;
  const mb = kb / 1024;
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  return `${kb.toFixed(2)} KB`;
});

// Active preloads
const activePreloads = computed(() => {
  const preloads: Record<string, { isPreloading: boolean; progress: number }> =
    {};
  modelCacheStore.preloadStatus.forEach((status, path) => {
    if (status.isPreloading) {
      preloads[path] = status;
    }
  });
  return preloads;
});

const hasActivePreloads = computed(
  () => Object.keys(activePreloads.value).length > 0
);

// Helper to get filename from path
const getFileName = (path: string): string => {
  return path.split("/").pop() ?? path;
};

// Refresh stats
const refreshStats = async (): Promise<void> => {
  try {
    cacheSize.value = await getCacheSize();
    memoryCount.value = modelCacheStore.size();
  } catch (error) {
    console.error("Error refreshing stats:", error);
  }
};

// Clear specific model
const clearModel = async (path: string): Promise<void> => {
  if (confirm(`Clear cache for: ${getFileName(path)}?`)) {
    try {
      await clearCache(path);
      await refreshStats();
    } catch (error) {
      console.error("Error clearing model:", error);
    }
  }
};

// Clear all cache
const clearAllCache = async (): Promise<void> => {
  if (
    confirm("Clear entire model cache? This will delete all cached models.")
  ) {
    try {
      await clearCache();
      await refreshStats();
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  }
};

// Test preload
const testPreload = async (): Promise<void> => {
  const testPath =
    import.meta.env.VITE_PATH +
    "optimeret_version_-_standard_vessel_with_LARS.glb";
  try {
    console.log("Starting test preload...");
    await modelCacheStore.preload(testPath);
    console.log("Test preload completed!");
    await refreshStats();
  } catch (error) {
    console.error("Test preload failed:", error);
  }
};

// Check IndexedDB directly
const checkIndexedDB = async (): Promise<void> => {
  try {
    const isCached = await modelCacheStore.has(
      import.meta.env.VITE_PATH +
        "optimeret_version_-_standard_vessel_with_LARS.glb"
    );
    console.log("Model cached in IndexedDB:", isCached);
    alert(`Model cached in IndexedDB: ${isCached}`);
  } catch (error) {
    console.error("Error checking IndexedDB:", error);
  }
};

// Auto-refresh stats
let refreshInterval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  refreshStats().catch(console.error);
  // Refresh every 2 seconds
  refreshInterval = setInterval(() => {
    refreshStats().catch(console.error);
  }, 2000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<style lang="scss" scoped>
/* Scrollbar styling for cached paths list */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
