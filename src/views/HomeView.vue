<template>
  <h1 class="text-3xl font-bold underline text-center my-8">Velkommen!</h1>
  <p class="text-center mb-4">
    Tryk på knappen nedenfor for at åbne 3D-visningen.
  </p>
  <div class="text-center">
    <button
      @click="openModel(modelPath)"
      @mouseenter="handleHover(modelPath)"
      class="group relative overflow-hidden rounded-xl bg-linear-to-r from-indigo-500 via-indigo-400 to-sky-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-400 hover:via-sky-400 hover:to-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <span
        class="absolute inset-0 -translate-x-full bg-white/20 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
      ></span>
      <span class="relative">Open 3D View</span>
    </button>
  </div>
  <div class="text-center pt-10">
    <button
      @click="openModel(uopPath)"
      @mouseenter="handleHover(uopPath)"
      class="group relative overflow-hidden rounded-xl bg-linear-to-r from-indigo-500 via-indigo-400 to-sky-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-400 hover:via-sky-400 hover:to-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <span
        class="absolute inset-0 -translate-x-full bg-white/20 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
      ></span>
      <span class="relative">View Unoptimized 3D Model</span>
    </button>
  </div>

  <!-- 3D Model Viewer Modal -->
  <ThreeModelViewer
    v-if="showModelViewer"
    v-model="showModelViewer"
    :model-path="selectedModelPath"
    modal
    title="3D-visning"
    instructions="Venstre klik eller piletaster for at rotere kameraet. Scroll for at zoome. Mellemrum for at nulstille visningen."
  />

  <!-- Debug Component (dev mode only) -->
  <ModelCacheDebug />
</template>

<script setup lang="ts">
// Imports
import { ref } from "vue";

// Project imports
import ThreeModelViewer from "../components/ThreeModelViewer.vue";
import ModelCacheDebug from "../components/ModelCacheDebug.vue";
import { useModelPreload } from "../modules/three/useModelPreload";

const showModelViewer = ref(false);
const selectedModelPath = ref("");

const modelPath =
  import.meta.env.VITE_PATH +
  "optimeret_version_-_standard_vessel_with_LARS.glb";

const uopPath = import.meta.env.VITE_PATH + "scene.glb";

// Model preloading on hover
const { handleHover } = useModelPreload();

// Function to open model viewer with selected path
const openModel = (path: string): void => {
  selectedModelPath.value = path;
  showModelViewer.value = true;
};
</script>

<style lang="scss" scoped></style>
