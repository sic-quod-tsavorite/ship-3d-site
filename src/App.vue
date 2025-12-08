<template>
  <div class="flex flex-col min-h-screen bg-gray-100 text-gray-800">
    <TheNavigation />
    <main>
      <RouterView />
    </main>

    <!-- Debug Component (dev mode only) -->
    <ModelCacheDebug />
  </div>
</template>

<script setup lang="ts">
// Imports
import { RouterView } from "vue-router";

// Project imports
import TheNavigation from "./components/TheNavigation.vue";
import ModelCacheDebug from "./components/ModelCacheDebug.vue";
</script>

<style lang="scss" scoped></style>
