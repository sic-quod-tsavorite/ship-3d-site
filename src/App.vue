<template>
  <div class="flex flex-col min-h-screen bg-gray-100 text-gray-800">
    <TheNavigation v-if="showNavigation" />
    <main class="grow container mx-auto p-4">
      <RouterView />
    </main>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
// Imports
import { RouterView } from "vue-router";
import { computed } from "vue";
import { storeToRefs } from "pinia";

// Project imports
import TheNavigation from "./components/TheNavigation.vue";
import TheFooter from "./components/TheFooter.vue";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const { isLoggedIn } = storeToRefs(auth);

const showNavigation = computed<boolean>(
  () => import.meta.env.DEV || isLoggedIn.value
);
</script>

<style lang="scss" scoped></style>
