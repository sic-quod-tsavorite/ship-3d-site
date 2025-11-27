<template>
  <h1 class="text-3xl font-bold underline text-center my-8">Velkommen!</h1>
  <p class="text-center mb-4">
    Tryk på knappen nedenfor for at åbne 3D-visningen.
  </p>
  <div class="text-center">
    <button
      @click="showModelViewer = true"
      class="group relative overflow-hidden rounded-xl bg-linear-to-r from-indigo-500 via-indigo-400 to-sky-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-400 hover:via-sky-400 hover:to-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <span
        class="absolute inset-0 -translate-x-full bg-white/20 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
      ></span>
      <span class="relative">Open 3D View</span>
    </button>
  </div>

  <div
    v-if="showModelViewer"
    class="fixed inset-0 z-999 flex items-center justify-center bg-black/40 bg-opacity-50 backdrop-blur-sm"
    @click.self="showModelViewer = false"
  >
    <div
      class="slide-in-scale relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-xl shadow-slate-200/60"
    >
      <h2 class="mb-2 text-center text-lg font-semibold text-slate-900">
        3D-visning
      </h2>
      <p class="mb-4 text-center text-xs text-slate-600">
        Venstre klik eller piletaster for at rotere kameraet. Scroll for at
        zoome. Mellemrum for at nulstille visningen.
      </p>
      <ThreeModelViewer :model-path="dynamic_path" class="flex-1" />
      <button
        @click="showModelViewer = false"
        class="absolute right-3 top-3 group overflow-hidden rounded-xl bg-linear-to-r from-slate-600 via-slate-500 to-slate-600 p-1.5 text-white transition hover:from-slate-500 hover:via-slate-400 hover:to-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-600"
      >
        <span
          class="absolute inset-0 -translate-x-full bg-white/20 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
        ></span>
        <XMarkIcon class="h-6 w-6" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Imports
import { ref } from "vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";

// Project imports
import ThreeModelViewer from "../components/ThreeModelViewer.vue";

const showModelViewer = ref(false);

const dynamic_path =
  import.meta.env.VITE_PATH +
  "optimeret_version_-_standard_vessel_with_LARS.glb";
</script>

<style lang="scss" scoped></style>
