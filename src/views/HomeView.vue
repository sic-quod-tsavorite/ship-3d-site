<template>
  <h1 class="text-3xl font-bold underline text-center my-8">Velkommen!</h1>
  <p class="text-center mb-4">
    Venstre klik for at roterer kameraet. Højre klik for at panorerer kameraet.
    Scroll for at zoom.
  </p>
  <ThreeModelViewer
    :model-path="dynamic_path"
    class="outline drop-shadow-2xl"
  />
</template>

<script setup lang="ts">
import ThreeModelViewer from "../components/ThreeModelViewer.vue";

const dynamic_path =
  import.meta.env.VITE_PATH +
  "optimeret_version_-_standard_vessel_with_LARS.glb";
</script>

<style lang="scss" scoped></style>
