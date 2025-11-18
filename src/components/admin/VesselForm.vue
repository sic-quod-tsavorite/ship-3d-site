<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div
      class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
    >
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-2xl font-bold">
          {{ isEditMode ? "Edit Vessel" : "Create New Vessel" }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-500 transition hover:text-gray-700"
        >
          <svg
            class="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Name Field -->
        <div>
          <label for="name" class="mb-1 block text-sm font-medium">
            Name
            <span class="text-red-600">*</span>
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            class="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter vessel name"
          />
        </div>

        <!-- Description Field -->
        <div>
          <label for="description" class="mb-1 block text-sm font-medium">
            Description
            <span class="text-red-600">*</span>
          </label>
          <textarea
            id="description"
            v-model="formData.description"
            required
            rows="4"
            class="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter vessel description"
          ></textarea>
        </div>

        <!-- Image Upload -->
        <div>
          <label for="image" class="mb-1 block text-sm font-medium">
            Image
            <span v-if="!isEditMode" class="text-red-600">*</span>
            <span class="text-xs text-gray-500">
              (PNG, JPEG, WebP, max 10MB)
            </span>
          </label>
          <input
            id="image"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            :required="!isEditMode"
            @change="handleImageChange"
            class="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p v-if="imageError" class="mt-1 text-sm text-red-600">
            {{ imageError }}
          </p>
          <div v-if="imagePreview" class="mt-2">
            <img
              :src="imagePreview"
              alt="Preview"
              class="h-32 w-32 rounded object-cover"
            />
          </div>
          <div v-else-if="isEditMode && vessel" class="mt-2">
            <p class="text-sm text-gray-600">Current: {{ vessel.image }}</p>
            <img
              :src="getImageUrl(vessel.image)"
              :alt="vessel.name"
              class="mt-1 h-32 w-32 rounded object-cover"
            />
          </div>
        </div>

        <!-- 3D Model Upload -->
        <div>
          <label for="object" class="mb-1 block text-sm font-medium">
            3D Model
            <span v-if="!isEditMode" class="text-red-600">*</span>
            <span class="text-xs text-gray-500">(GLB, GLTF, max 50MB)</span>
          </label>
          <input
            id="object"
            type="file"
            accept=".glb,.gltf"
            :required="!isEditMode"
            @change="handleObjectChange"
            class="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p v-if="objectError" class="mt-1 text-sm text-red-600">
            {{ objectError }}
          </p>
          <div v-if="formData.objectFile" class="mt-2">
            <p class="text-sm text-gray-600">
              Selected: {{ formData.objectFile.name }} ({{
                formatFileSize(formData.objectFile.size)
              }})
            </p>
          </div>
          <div v-else-if="isEditMode && vessel" class="mt-2">
            <p class="text-sm text-gray-600">Current: {{ vessel.object }}</p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="submitError" class="rounded bg-red-100 p-3 text-red-700">
          {{ submitError }}
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="rounded border border-gray-300 px-4 py-2 transition hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ loading ? "Saving..." : isEditMode ? "Update" : "Create" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, unref } from "vue";
import type { Ref } from "vue";
import type { Vessel } from "@/interfaces/vesselInterfaces";
import { useVesselForm } from "@/modules/vessels/useVesselForm";
import { formatFileSize } from "@/utils/fileHelpers";

interface Props {
  vessel?: Vessel;
  loading: boolean | Ref<boolean>;
  validateImageFile: (file: File | null) => string | null;
  validateObjectFile: (file: File | null) => string | null;
  getImageUrl: (path: string) => string;
}

interface Emits {
  (e: "close"): void;
  (
    e: "submit",
    data: {
      name: string;
      description: string;
      imageFile: File | null;
      objectFile: File | null;
    }
  ): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const loading = computed(() => unref(props.loading));

const {
  isEditMode,
  formData,
  imagePreview,
  imageError,
  objectError,
  submitError,
  handleImageChange,
  handleObjectChange,
  validateForm,
  getFormData,
} = useVesselForm(
  props.vessel,
  props.validateImageFile,
  props.validateObjectFile
);

const handleSubmit = (): void => {
  if (validateForm()) {
    emit("submit", getFormData());
  }
};
</script>

<style lang="scss" scoped></style>
