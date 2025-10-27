<script setup lang="ts">
import TheNavigation from "./components/TheNavigation.vue";
import TheFooter from "./components/TheFooter.vue";
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-100 text-gray-800">
    <TheNavigation />
    <main class="grow container mx-auto p-4">
      <h1 class="text-3xl font-bold underline text-center my-8">Velkommen!</h1>
      <p class="text-center mb-4">
        Venstre klik for at roterer kameraet. Højre klik for at panorerer
        kameraet. Scroll for at zoom.
      </p>
    </main>
    <TheFooter />
  </div>
</template>

<style lang="scss" scoped></style>
