<template>
  <!-- Modal Wrapper (optional) -->
  <Teleport v-if="modal" to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-999 flex items-center justify-center bg-black/40 bg-opacity-50 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <div
        class="slide-in-scale relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-xl shadow-slate-200/60"
      >
        <h2
          v-if="title"
          class="mb-2 text-center text-lg font-semibold text-slate-900"
        >
          {{ title }}
        </h2>
        <p v-if="instructions" class="mb-4 text-center text-xs text-slate-600">
          {{ instructions }}
        </p>
        <div ref="container" class="three-model-container flex-1">
          <div v-if="isLoading" class="loading-overlay">
            <div class="loading-spinner"></div>
            <p>Loading... {{ loadingProgress }}%</p>
          </div>
          <button
            @click="toggleFullscreen"
            class="absolute bottom-3 right-3 rounded-xl bg-white text-slate-900 border-3 border-slate-500 p-1.5 transition-colors hover:bg-[#BCD5E5] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/50 z-10"
            :title="
              isFullscreen
                ? 'Exit fullscreen (F or Esc)'
                : 'Enter fullscreen (F)'
            "
          >
            <ArrowsPointingInIcon v-if="isFullscreen" class="h-6 w-6" />
            <ArrowsPointingOutIcon v-else class="h-6 w-6" />
          </button>
        </div>
        <button
          @click="closeModal"
          class="absolute right-3 top-3 rounded-xl bg-white text-slate-900 border-3 border-slate-500 p-1.5 transition-colors hover:bg-[#BCD5E5]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/50"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>
    </div>
  </Teleport>

  <!-- Standalone Viewer (default) -->
  <div v-else ref="container" class="three-model-container">
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Loading... {{ loadingProgress }}%</p>
    </div>
    <button
      @click="toggleFullscreen"
      class="absolute bottom-3 right-3 rounded-xl bg-white text-slate-900 border-3 border-slate-500 p-1.5 transition-colors hover:bg-[#BCD5E5] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/50 z-10"
      :title="
        isFullscreen ? 'Exit fullscreen (F or Esc)' : 'Enter fullscreen (F)'
      "
    >
      <ArrowsPointingInIcon v-if="isFullscreen" class="h-6 w-6" />
      <ArrowsPointingOutIcon v-else class="h-6 w-6" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  XMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from "@heroicons/vue/24/outline";

// Project imports
import { useThree } from "../modules/three/useThree";
import { useFullscreen } from "../modules/useFullscreen";
import type {
  ThreeModelViewerProps,
  ThreeModelViewerEmits,
} from "../interfaces/ThreeModelViewer";

const props = withDefaults(defineProps<ThreeModelViewerProps>(), {
  modal: false,
  modelValue: false,
  title: "3D View",
  instructions:
    "Left click or arrow keys to rotate camera. Scroll to zoom. Spacebar to reset view. Press F for fullscreen.",
});

const emit = defineEmits<ThreeModelViewerEmits>();

const container = ref<HTMLElement | null>(null);
const { isLoading, loadingProgress } = useThree(container, props.modelPath);
const { isFullscreen, toggleFullscreen } = useFullscreen(container);

const closeModal = (): void => {
  emit("update:modelValue", false);
};
</script>

<style lang="scss" scoped></style>
