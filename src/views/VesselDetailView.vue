<template>
  <!-- Loading State -->
  <div v-if="loading"></div>

  <!-- Error State -->
  <div v-else-if="error" class="flex items-center justify-center h-screen">
    <div class="text-lg text-red-400">{{ error }}</div>
  </div>

  <!-- Vessel Not Found -->
  <div v-else-if="!vessel" class="flex items-center justify-center h-screen">
    <NotFound />
  </div>

  <!-- Main Content -->
  <div v-else class="relative h-screen w-full overflow-hidden">
    <!-- Background Image -->
    <div class="absolute inset-0 z-0">
      <img
        :src="getImageUrl(vessel.image)"
        :alt="vessel.name"
        class="h-full w-full object-cover"
      />
    </div>

    <!-- Content Overlay -->
    <div
      class="relative z-10 flex h-full items-center justify-center p-4 sm:justify-end sm:p-8"
    >
      <!-- Semi-transparent Box -->
      <div
        class="max-w-full sm:max-w-lg max-h-[95vh] rounded-2xl bg-[#0D2638]/80 backdrop-blur-md p-6 sm:p-8 shadow-xl shadow-slate-900/20 flex flex-col overflow-y-auto"
      >
        <!-- Vessel Name -->
        <h1
          class="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight shrink-0"
        >
          {{ vessel.name }}
        </h1>

        <!-- Vessel Description -->
        <div
          class="text-sm sm:text-base text-slate-200 mb-6 leading-relaxed markdown-content flex-1 overflow-y-auto"
          v-html="parseMarkdown(vessel.description)"
        ></div>

        <!-- Open 3D View Button -->
        <button
          @click="openModelViewer"
          @mouseenter="handleModelHover"
          class="rounded-xl bg-white/80 text-black border-3 border-[#BCD5E5] px-4 py-2 text-sm sm:px-5 sm:py-3 sm:text-base font-medium shadow-sm transition-colors hover:bg-[#BCD5E5]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BCD5E5]/50 shrink-0 max-w-max"
        >
          <span class="flex items-center gap-2">
            OPEN 3D VIEW
            <ChevronRightIcon class="h-5 w-5" />
          </span>
        </button>
      </div>
    </div>

    <!-- 3D Model Viewer Modal -->
    <ThreeModelViewer
      v-if="isModelViewerOpen"
      v-model="isModelViewerOpen"
      :model-path="getObjectUrl(vessel.object)"
      :title="vessel.name"
      modal
    />
  </div>
</template>

<script setup lang="ts">
// Imports
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { ChevronRightIcon } from "@heroicons/vue/24/outline";

// Project imports
import ThreeModelViewer from "@/components/ThreeModelViewer.vue";
import { useVessels } from "@/modules/vessels/useVessels";
import { useModelPreload } from "@/modules/three/useModelPreload";
import { parseMarkdown } from "@/utils/markdownHelpers";
import type { Vessel } from "@/interfaces/vesselInterfaces";
import NotFound from "./NotFound.vue";

const route = useRoute();
const { vessels, loading, error, fetchVessels, getImageUrl, getObjectUrl } =
  useVessels();
const { handleHover } = useModelPreload();

const vessel = ref<Vessel | null>(null);
const isModelViewerOpen = ref<boolean>(false);

const openModelViewer = (): void => {
  isModelViewerOpen.value = true;
};

const handleModelHover = (): void => {
  if (vessel.value) {
    handleHover(getObjectUrl(vessel.value.object));
  }
};

const updateVessel = (): void => {
  const id = route.params.id as string;
  vessel.value =
    vessels.value.find((v: Vessel): boolean => v._id === id) ?? null;
};

onMounted(async (): Promise<void> => {
  await fetchVessels();
  updateVessel();
});

watch(
  () => route.params.id,
  (): void => {
    updateVessel();
  }
);
</script>

<style scoped></style>
