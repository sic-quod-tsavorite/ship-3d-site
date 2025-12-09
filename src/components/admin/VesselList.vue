<template>
  <div class="w-full">
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h2 class="text-2xl font-semibold tracking-tight text-slate-900">
        Vessels
      </h2>
      <button
        @click="$emit('create')"
        class="group relative overflow-hidden rounded-xl bg-linear-to-r from-indigo-500 via-indigo-400 to-sky-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-400 hover:via-sky-400 hover:to-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <span
          class="absolute inset-0 -translate-x-full bg-white/20 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
        ></span>
        <span class="relative">Add New Vessel</span>
      </button>
    </div>

    <div v-if="loading" class="py-8 text-center">
      <p class="text-sm text-slate-500">Loading vessels...</p>
    </div>

    <div
      v-else-if="error"
      class="rounded-xl border border-red-300/40 bg-red-50 p-4 text-sm text-red-700"
    >
      {{ error }}
    </div>

    <div v-else-if="vessels.length === 0" class="py-8 text-center">
      <p class="text-sm text-slate-500">
        No vessels found. Create your first vessel!
      </p>
    </div>

    <div v-else>
      <!-- Search and Filters -->
      <div class="mb-4 flex flex-wrap items-center gap-4">
        <div class="flex-1 min-w-[200px]">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search vessels by name or description..."
            class="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>
        <div class="min-w-40">
          <select
            v-model="categoryFilter"
            class="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            <option value="">All Categories</option>
            <option v-for="cat in availableCategories" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>
        <div v-if="selectedIds.size > 0" class="flex items-center gap-2">
          <span class="text-xs font-medium text-slate-600">
            {{ selectedIds.size }} selected
          </span>
          <button
            @click="handleBatchDelete"
            class="rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            Delete Selected
          </button>
          <button
            @click="selectedIds.clear()"
            class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Clear Selection
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table class="w-full border-collapse bg-white">
          <thead class="sticky top-0 z-10 bg-slate-50/80 backdrop-blur">
            <tr>
              <th
                class="w-12 border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold text-slate-600"
              >
                <input
                  type="checkbox"
                  :checked="allSelected"
                  :indeterminate="someSelected"
                  @change="toggleSelectAll"
                  class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th
                class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                Image
              </th>
              <th
                class="cursor-pointer border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:bg-slate-100"
                @click="toggleSort('name')"
              >
                <div class="flex items-center gap-1">
                  Name
                  <span v-if="sortField === 'name'" class="text-xs">
                    {{ sortDirection === "asc" ? "↑" : "↓" }}
                  </span>
                </div>
              </th>
              <th
                class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                Description
              </th>
              <th
                class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                Category
              </th>
              <th
                class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                Preview
              </th>
              <th
                class="border-b border-slate-200 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="vessel in filteredAndSortedVessels"
              :key="vessel._id"
              :class="[
                'transition',
                selectedIds.has(vessel._id)
                  ? 'bg-indigo-50/60'
                  : 'hover:bg-slate-50',
              ]"
            >
              <td class="border-b border-slate-200 px-4 py-3">
                <input
                  type="checkbox"
                  :checked="selectedIds.has(vessel._id)"
                  @change="toggleSelection(vessel._id)"
                  class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </td>
              <td class="border-b border-slate-200 px-4 py-3">
                <img
                  :src="getImageUrl(vessel.image)"
                  :alt="vessel.name"
                  loading="lazy"
                  class="h-16 w-16 cursor-pointer rounded object-cover shadow-sm ring-1 ring-slate-200/60 transition hover:opacity-80"
                  @click="openImageViewer(vessel)"
                />
              </td>
              <td class="border-b border-slate-200 px-4 py-3">
                <span class="font-medium text-slate-900">
                  {{ vessel.name }}
                </span>
              </td>
              <td class="border-b border-slate-200 px-4 py-3">
                <span class="line-clamp-2 text-xs text-slate-600 max-w-60">
                  {{ vessel.description }}
                </span>
              </td>
              <td class="border-b border-slate-200 px-4 py-3">
                <span
                  v-if="vessel.category"
                  class="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-medium"
                >
                  {{ vessel.category }}
                </span>
                <span v-else class="text-slate-400 text-xs">—</span>
              </td>
              <td class="border-b border-slate-200 px-4 py-3">
                <button
                  @click="openModelViewer(vessel)"
                  @mouseenter="handleHover(getObjectUrl(vessel.object))"
                  class="group relative overflow-hidden rounded-xl bg-linear-to-r from-indigo-500 via-indigo-400 to-sky-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-400 hover:via-sky-400 hover:to-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <span
                    class="absolute inset-0 -translate-x-full bg-white/20 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
                  ></span>
                  <span class="relative">View 3D</span>
                </button>
              </td>
              <td class="border-b border-slate-200 px-4 py-3 text-right">
                <div class="flex justify-end gap-2">
                  <button
                    @click="$emit('edit', vessel)"
                    class="group relative overflow-hidden rounded-xl bg-linear-to-r from-amber-500 via-amber-400 to-orange-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-amber-500/30 transition hover:from-amber-400 hover:via-orange-400 hover:to-orange-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    <span
                      class="absolute inset-0 -translate-x-full bg-white/20 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
                    ></span>
                    <span class="relative">Edit</span>
                  </button>
                  <button
                    @click="handleDelete(vessel)"
                    class="group relative overflow-hidden rounded-xl bg-linear-to-r from-red-500 via-red-400 to-pink-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-red-500/30 transition hover:from-red-400 hover:via-pink-400 hover:to-pink-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    <span
                      class="absolute inset-0 -translate-x-full bg-white/20 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
                    ></span>
                    <span class="relative">Delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 text-xs font-medium text-slate-600">
        Showing {{ filteredAndSortedVessels.length }} of
        {{ vessels.length }} vessels
      </div>
    </div>

    <!-- 3D Model Viewer Modal -->
    <ThreeModelViewer
      v-if="isModelViewerOpen"
      v-model="isModelViewerOpen"
      :model-path="getObjectUrl(selectedModel!.object)"
      :title="selectedModel!.name"
      modal
    />

    <!-- Image Viewer Modal -->
    <Teleport to="body">
      <div
        v-if="selectedImage"
        class="fixed inset-0 z-999 flex items-center justify-center bg-black/40 bg-opacity-50 backdrop-blur-sm"
        @click.self="closeImageViewer"
      >
        <div
          class="slide-in-scale relative flex max-h-[90vh] w-full max-w-4xl items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl shadow-slate-200/60"
        >
          <img
            :src="getImageUrl(selectedImage.image)"
            :alt="selectedImage.name"
            class="max-h-full max-w-full object-contain"
          />
          <button
            @click="closeImageViewer"
            class="absolute right-3 top-3 group overflow-hidden rounded-xl bg-linear-to-r from-slate-600 via-slate-500 to-slate-600 p-1.5 text-white transition hover:from-slate-500 hover:via-slate-400 hover:to-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-600"
          >
            <span
              class="absolute inset-0 -translate-x-full bg-white/20 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
            ></span>
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
// Imports
import { ref, toRef, watch } from "vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";

// Project imports
import type { Vessel } from "@/interfaces/vesselInterfaces";
import ThreeModelViewer from "@/components/ThreeModelViewer.vue";
import { useVesselList } from "@/modules/vessels/useVesselList";
import { useCategoryList } from "@/modules/vessels/useCategoryList";
import { useModelPreload } from "@/modules/three/useModelPreload";

interface Props {
  vessels: Vessel[];
  loading: boolean;
  error: string | null;
  getImageUrl: (path: string) => string;
  getObjectUrl: (path: string) => string;
}

interface Emits {
  (e: "create"): void;
  (e: "edit", vessel: Vessel): void;
  (e: "delete", id: string): void;
  (e: "batchDelete", ids: string[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const {
  searchQuery,
  sortField,
  sortDirection,
  selectedIds,
  selectedModel,
  categoryFilter,
  filteredAndSortedVessels,
  allSelected,
  someSelected,
  toggleSelection,
  toggleSelectAll,
  clearSelection,
  toggleSort,
  openModelViewer,
  closeModelViewer,
} = useVesselList(toRef(props, "vessels"));

// Category list
const { categories: availableCategories } = useCategoryList(
  toRef(props, "vessels")
);

// Model preloading on hover
const { handleHover } = useModelPreload();

// Model viewer state management
const isModelViewerOpen = ref(false);

// Sync selectedModel with isModelViewerOpen
watch(selectedModel, (newValue) => {
  if (newValue) {
    isModelViewerOpen.value = true;
  }
});

watch(isModelViewerOpen, (newValue) => {
  if (!newValue) {
    closeModelViewer();
  }
});

// Image viewer state
const selectedImage = ref<Vessel | null>(null);

const openImageViewer = (vessel: Vessel): void => {
  selectedImage.value = vessel;
};

const closeImageViewer = (): void => {
  selectedImage.value = null;
};

// Delete handlers
const handleDelete = (vessel: Vessel): void => {
  if (
    confirm(
      `Are you sure you want to delete "${vessel.name}"? This action cannot be undone.`
    )
  ) {
    emit("delete", vessel._id);
  }
};

const handleBatchDelete = (): void => {
  const count = selectedIds.value.size;
  if (
    confirm(
      `Are you sure you want to delete ${count} vessel${count > 1 ? "s" : ""}? This action cannot be undone.`
    )
  ) {
    emit("batchDelete", Array.from(selectedIds.value));
    clearSelection();
  }
};
</script>

<style lang="scss" scoped></style>
