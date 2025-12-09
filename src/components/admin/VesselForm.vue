<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-50 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div
      class="slide-in-scale max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-sm"
    >
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-2xl font-semibold tracking-tight text-slate-900">
          {{ isEditMode ? "Edit Vessel" : "Create New Vessel" }}
        </h2>
        <button
          @click="$emit('close')"
          class="group relative overflow-hidden rounded-xl bg-linear-to-r from-slate-600 via-slate-500 to-slate-600 p-1.5 text-white transition hover:from-slate-500 hover:via-slate-400 hover:to-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-600"
        >
          <span
            class="absolute inset-0 -translate-x-full bg-white/20 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
          ></span>
          <XMarkIcon class="relative h-6 w-6" />
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

        <!-- Category Field -->
        <div>
          <label for="category" class="mb-1 block text-sm font-medium">
            Category
            <span class="text-red-600">*</span>
          </label>

          <!-- Category Input -->
          <div class="relative">
            <input
              id="category"
              v-model="categorySearchInput"
              type="text"
              placeholder="Search or create category..."
              @focus="showCategoryDropdown = true"
              @blur="handleCategoryBlur"
              class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />

            <!-- Category Dropdown -->
            <div
              v-if="showCategoryDropdown"
              class="absolute top-full left-0 right-0 z-10 mt-1 border border-slate-300 rounded-xl bg-white shadow-lg max-h-40 overflow-y-auto"
            >
              <!-- Existing categories -->
              <button
                v-for="cat in filteredCategories"
                :key="cat"
                type="button"
                @click="selectCategory(cat)"
                class="w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 transition text-slate-900"
              >
                {{ cat }}
              </button>

              <!-- Create new option -->
              <div
                v-if="
                  categorySearchInput &&
                  !filteredCategories.includes(categorySearchInput)
                "
                class="border-t border-slate-200"
              >
                <button
                  type="button"
                  @click="createNewCategory()"
                  class="w-full px-3 py-2 text-left text-sm bg-indigo-50 hover:bg-indigo-100 font-medium text-indigo-900 transition"
                >
                  + Create "{{ categorySearchInput }}"
                </button>
              </div>

              <!-- Empty state -->
              <div
                v-if="availableCategories.length === 0 && !categorySearchInput"
                class="px-3 py-2 text-sm text-slate-500 text-center"
              >
                No categories yet
              </div>
            </div>
          </div>

          <!-- Selected category display -->
          <div v-if="formData.category" class="mt-2">
            <span
              class="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"
            >
              {{ formData.category }}
              <button
                type="button"
                @click="clearCategory"
                class="hover:text-indigo-900 font-bold"
              >
                ×
              </button>
            </span>
          </div>
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
            class="group relative overflow-hidden rounded-xl bg-linear-to-r from-slate-500 via-slate-400 to-slate-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-slate-500/30 transition hover:from-slate-400 hover:via-slate-300 hover:to-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
          >
            <span
              class="absolute inset-0 -translate-x-full bg-white/20 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
            ></span>
            <span class="relative">Cancel</span>
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
import { computed, unref, ref, toRef, watch } from "vue";
import type { Ref } from "vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";

// Project imports
import type { Vessel } from "@/interfaces/vesselInterfaces";
import { useVesselForm } from "@/modules/vessels/useVesselForm";
import { useCategoryList } from "@/modules/vessels/useCategoryList";
import { formatFileSize } from "@/utils/fileHelpers";

interface Props {
  vessel?: Vessel;
  vessels: Vessel[];
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
      category: string;
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

// Category management
const { categories: availableCategories } = useCategoryList(
  toRef(props, "vessels")
);
const categorySearchInput = ref<string>("");
const showCategoryDropdown = ref<boolean>(false);

const filteredCategories = computed<string[]>(() => {
  if (!categorySearchInput.value.trim()) {
    return availableCategories.value;
  }

  const query = categorySearchInput.value.toLowerCase();
  return availableCategories.value.filter((cat: string): boolean =>
    cat.toLowerCase().includes(query)
  );
});

// Watch formData.category and sync with categorySearchInput when editing
let isInitializing = true;
watch(
  (): string => formData.category,
  (newValue: string): void => {
    if (isInitializing && newValue) {
      categorySearchInput.value = newValue;
      isInitializing = false;
    }
  }
);

const selectCategory = (category: string): void => {
  formData.category = category;
  categorySearchInput.value = category;
  showCategoryDropdown.value = false;
};

const createNewCategory = (): void => {
  const newCategory = categorySearchInput.value.trim();
  if (newCategory) {
    formData.category = newCategory;
    categorySearchInput.value = newCategory;
    showCategoryDropdown.value = false;
  }
};

const clearCategory = (): void => {
  formData.category = "";
  categorySearchInput.value = "";
};

const handleCategoryBlur = (): void => {
  // Delay closing dropdown to allow click event to register
  setTimeout((): void => {
    showCategoryDropdown.value = false;
  }, 200);
};

const handleSubmit = (): void => {
  if (validateForm()) {
    emit("submit", getFormData());
  }
};
</script>

<style lang="scss" scoped></style>
