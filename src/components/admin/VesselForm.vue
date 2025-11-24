<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-50"
  >
    <div
      class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-sm"
    >
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-2xl font-semibold tracking-tight text-slate-900">
          {{ isEditMode ? "Edit Vessel" : "Create New Vessel" }}
        </h2>
        <button
          @click="$emit('close')"
          class="rounded-lg p-1.5 text-white transition hover:bg-slate-100 hover:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <XMarkIcon class="h-6 w-6" />
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
            class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
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
            class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
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
            class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
          <p v-if="imageError" class="mt-1 text-sm text-red-600">
            {{ imageError }}
          </p>
          <div v-if="imagePreview" class="mt-2">
            <img
              :src="imagePreview"
              alt="Preview"
              class="h-32 w-32 rounded-xl object-cover ring-1 ring-slate-200"
            />
          </div>
          <div v-else-if="isEditMode && vessel" class="mt-2">
            <p class="text-sm text-gray-600">Current: {{ vessel.image }}</p>
            <img
              :src="getImageUrl(vessel.image)"
              :alt="vessel.name"
              class="mt-1 h-32 w-32 rounded-xl object-cover ring-1 ring-slate-200"
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
            class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
          <p v-if="objectError" class="mt-1 text-sm text-red-600">
            {{ objectError }}
          </p>
          <div v-if="formData.objectFile" class="mt-2 text-xs text-slate-600">
            Selected: {{ formData.objectFile.name }} ({{
              formatFileSize(formData.objectFile.size)
            }})
          </div>
          <div
            v-else-if="isEditMode && vessel"
            class="mt-2 text-xs text-slate-600"
          >
            Current: {{ vessel.object }}
          </div>
        </div>

        <!-- Error Message -->
        <div
          v-if="submitError"
          class="rounded-lg border border-red-300/40 bg-red-50 p-3 text-sm text-red-700"
        >
          {{ submitError }}
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-50 hover:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="group relative overflow-hidden rounded-xl bg-linear-to-r from-indigo-500 via-indigo-400 to-sky-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-400 hover:via-sky-400 hover:to-sky-300 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <span
              class="absolute inset-0 -translate-x-full bg-white/20 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
            ></span>
            <span class="relative">
              {{ loading ? "Saving..." : isEditMode ? "Update" : "Create" }}
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
// Imports
import { computed, unref } from "vue";
import type { Ref } from "vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";

// Project imports
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
