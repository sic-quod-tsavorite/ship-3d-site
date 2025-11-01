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
import TheNavigation from "./components/TheNavigation.vue";
import TheFooter from "./components/TheFooter.vue";
import { RouterView } from "vue-router";
</script>

<style lang="scss" scoped></style>
