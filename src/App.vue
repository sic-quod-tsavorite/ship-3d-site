<template>
  <div class="flex flex-col min-h-screen bg-gray-300 text-gray-800">
    <!-- Background image for home and vessel-detail views (once vessel bg loads) -->
    <div v-if="shouldShowHomeBg" class="fixed inset-0 z-0">
      <img
        src="/assets/images/Vessel_turbine_6_Edited-expanded.jpg"
        alt="Offshore vessel with turbine"
        loading="lazy"
        class="h-full w-full object-cover"
      />
    </div>

    <!-- Content wrapper -->
    <div
      :class="{
        'relative z-10':
          route.name === 'home' || route.name === 'vessel-detail',
      }"
    >
      <TheNavigation />
      <main>
        <RouterView />
      </main>

      <!-- Debug Component (dev mode only) -->
      <ModelCacheDebug />
    </div>
  </div>
</template>

<script setup lang="ts">
// Imports
import { computed } from "vue";
import { RouterView, useRoute } from "vue-router";

// Project imports
import TheNavigation from "./components/TheNavigation.vue";
import ModelCacheDebug from "./components/ModelCacheDebug.vue";
import { useImageLoadingStore } from "@/stores/imageLoading";

const route = useRoute();
const imageLoadingStore = useImageLoadingStore();

// Show home bg if on home route, or if on vessel-detail but vessel image is loaded
const shouldShowHomeBg = computed((): boolean => {
  if (route.name === "home") {
    return true;
  }
  if (route.name === "vessel-detail" && imageLoadingStore.vesselImageLoaded) {
    return true;
  }
  return false;
});
</script>

<style lang="scss" scoped></style>
