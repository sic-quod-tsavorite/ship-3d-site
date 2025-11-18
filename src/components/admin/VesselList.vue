<template>
  <div class="w-full">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-bold">Vessels</h2>
      <button
        @click="$emit('create')"
        class="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
      >
        Add New Vessel
      </button>
    </div>

    <div v-if="loading" class="py-8 text-center">
      <p class="text-gray-600">Loading vessels...</p>
    </div>

    <div v-else-if="error" class="rounded bg-red-100 p-4 text-red-700">
      {{ error }}
    </div>

    <div v-else-if="vessels.length === 0" class="py-8 text-center">
      <p class="text-gray-600">No vessels found. Create your first vessel!</p>
    </div>

    <div v-else>
      <!-- Search and Filters -->
      <div class="mb-4 flex flex-wrap items-center gap-4">
        <div class="flex-1 min-w-[200px]">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search vessels by name or description..."
            class="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div v-if="selectedIds.size > 0" class="flex items-center gap-2">
          <span class="text-sm text-gray-600">
            {{ selectedIds.size }} selected
          </span>
          <button
            @click="handleBatchDelete"
            class="rounded bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-700"
          >
            Delete Selected
          </button>
          <button
            @click="selectedIds.clear()"
            class="rounded border border-gray-300 px-4 py-2 text-sm transition hover:bg-gray-100"
          >
            Clear Selection
          </button>
        </div>
      </div>

      <!-- Virtual Scrolling Container -->
      <div class="overflow-x-auto rounded-lg border border-gray-200">
        <table class="w-full border-collapse bg-white">
          <thead class="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th
                class="border-b px-4 py-3 text-left text-sm font-semibold w-12"
              >
                <input
                  type="checkbox"
                  :checked="allSelected"
                  :indeterminate="someSelected"
                  @change="toggleSelectAll"
                  class="h-4 w-4 rounded border-gray-300"
                />
              </th>
              <th class="border-b px-4 py-3 text-left text-sm font-semibold">
                Image
              </th>
              <th
                class="border-b px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-gray-100"
                @click="toggleSort('name')"
              >
                <div class="flex items-center gap-1">
                  Name
                  <span v-if="sortField === 'name'" class="text-xs">
                    {{ sortDirection === "asc" ? "↑" : "↓" }}
                  </span>
                </div>
              </th>
              <th class="border-b px-4 py-3 text-left text-sm font-semibold">
                Description
              </th>
              <th class="border-b px-4 py-3 text-left text-sm font-semibold">
                Preview
              </th>
              <th class="border-b px-4 py-3 text-right text-sm font-semibold">
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
                selectedIds.has(vessel._id) ? 'bg-blue-50' : 'hover:bg-gray-50',
              ]"
            >
              <td class="border-b px-4 py-3">
                <input
                  type="checkbox"
                  :checked="selectedIds.has(vessel._id)"
                  @change="toggleSelection(vessel._id)"
                  class="h-4 w-4 rounded border-gray-300"
                />
              </td>
              <td class="border-b px-4 py-3">
                <img
                  :src="getImageUrl(vessel.image)"
                  :alt="vessel.name"
                  loading="lazy"
                  class="h-16 w-16 rounded object-cover cursor-pointer transition hover:opacity-80"
                  @click="openImageViewer(vessel)"
                />
              </td>
              <td class="border-b px-4 py-3">
                <span class="font-medium">{{ vessel.name }}</span>
              </td>
              <td class="border-b px-4 py-3">
                <span class="line-clamp-2 text-sm text-gray-600">
                  {{ vessel.description }}
                </span>
              </td>
              <td class="border-b px-4 py-3">
                <button
                  @click="openModelViewer(vessel)"
                  class="rounded bg-green-600 px-3 py-1 text-sm text-white transition hover:bg-green-700"
                >
                  View 3D
                </button>
              </td>
              <td class="border-b px-4 py-3 text-right">
                <div class="flex justify-end gap-2">
                  <button
                    @click="$emit('edit', vessel)"
                    class="rounded bg-yellow-500 px-3 py-1 text-sm text-white transition hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    @click="handleDelete(vessel)"
                    class="rounded bg-red-600 px-3 py-1 text-sm text-white transition hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Results Count -->
      <div class="mt-4 text-sm text-gray-600">
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
        <h3 class="text-center text-xl font-bold mb-2">
          {{ selectedModel.name }}
        </h3>
        <p class="text-center text-sm text-gray-600 mb-4">
          Left click or arrow keys to rotate camera. Scroll to zoom.
        </p>
        <ThreeModelViewer
          :model-path="getObjectUrl(selectedModel.object)"
          class="outline drop-shadow-2xl flex-1"
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
          class="max-w-full max-h-full object-contain"
        />
        <button @click="closeImageViewer" class="close-button">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRef } from "vue";
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
  background: #d8d8d8;
  padding: 20px;
  border-radius: 5px;
  position: relative;
  width: 90vw;
  height: 90vh;
  display: flex;
  flex-direction: column;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff4d4d;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}

.close-button:hover {
  background: #ff1a1a;
}

.image-popup-content {
  background: #fff;
  padding: 20px;
  border-radius: 5px;
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
