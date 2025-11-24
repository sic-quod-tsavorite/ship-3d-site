<template>
  <div class="flex flex-col min-h-screen bg-gray-100 text-gray-800">
    <TheNavigation />
    <main class="grow container mx-auto p-4">
      <RouterView />
    </main>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
// Imports
import { RouterView } from "vue-router";

// Project imports
import TheNavigation from "./components/TheNavigation.vue";
import TheFooter from "./components/TheFooter.vue";
</script>

<style lang="scss" scoped></style>
