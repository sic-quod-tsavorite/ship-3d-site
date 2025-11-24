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
            class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
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
                <span class="line-clamp-2 text-xs text-slate-600">
                  {{ vessel.description }}
                </span>
              </td>
              <td class="border-b border-slate-200 px-4 py-3">
                <button
                  @click="openModelViewer(vessel)"
                  class="rounded-lg bg-linear-to-r from-indigo-600 to-sky-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:from-indigo-500 hover:to-sky-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  View 3D
                </button>
              </td>
              <td class="border-b border-slate-200 px-4 py-3 text-right">
                <div class="flex justify-end gap-2">
                  <button
                    @click="$emit('edit', vessel)"
                    class="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    Edit
                  </button>
                  <button
                    @click="handleDelete(vessel)"
                    class="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    Delete
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
    <div
      v-if="selectedModel"
      class="popup-overlay"
      @click.self="closeModelViewer"
    >
      <div class="popup-content">
        <h3 class="mb-2 text-center text-lg font-semibold text-slate-900">
          {{ selectedModel.name }}
        </h3>
        <p class="mb-4 text-center text-xs text-slate-600">
          Left click or arrow keys to rotate camera. Scroll to zoom.
        </p>
        <ThreeModelViewer
          :model-path="getObjectUrl(selectedModel.object)"
          class="flex-1 outline drop-shadow-2xl"
        />
        <button @click="closeModelViewer" class="close-button">Close</button>
      </div>
    </div>

    <!-- Image Viewer Modal -->
    <div
      v-if="selectedImage"
      class="popup-overlay"
      @click.self="closeImageViewer"
    >
      <div class="image-popup-content">
        <img
          :src="getImageUrl(selectedImage.image)"
          :alt="selectedImage.name"
          class="max-h-full max-w-full object-contain"
        />
        <button @click="closeImageViewer" class="close-button">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Imports
import { ref, toRef } from "vue";

// Project imports
import type { Vessel } from "@/interfaces/vesselInterfaces";
import ThreeModelViewer from "@/components/ThreeModelViewer.vue";
import { useVesselList } from "@/modules/vessels/useVesselList";

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

<style lang="scss" scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-content {
  background: #ffffff;
  padding: 20px;
  border-radius: 16px;
  position: relative;
  width: 90vw;
  height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.08),
    0 8px 10px -6px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(100, 116, 139, 0.15);
}

.close-button {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(90deg, #ef4444, #dc2626);
  color: #fff;
  border: none;
  padding: 6px 14px;
  font-size: 12px;
  line-height: 1;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 12px -2px rgba(239, 68, 68, 0.4);
  transition:
    background 0.15s ease,
    transform 0.15s ease;
}
.close-button:hover {
  background: linear-gradient(90deg, #f87171, #ef4444);
}
.close-button:active {
  transform: translateY(1px);
}

.image-popup-content {
  background: #ffffff;
  padding: 20px;
  border-radius: 16px;
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.08),
    0 8px 10px -6px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(100, 116, 139, 0.15);
}
</style>
