<template>
  <div ref="container" class="model-container">
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Loading... {{ loadingProgress }}%</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Imports
import { ref } from "vue";

// Project imports
import { useThree } from "../modules/three/useThree";

const props = defineProps({
  modelPath: {
    type: String,
    required: true,
  },
});

const container = ref(null);
const { isLoading, loadingProgress } = useThree(container, props.modelPath);
</script>

<style lang="scss" scoped>
.model-container {
  width: 100%;
  max-width: 960px;
  aspect-ratio: 16 / 9;
  min-height: 400px;
  position: relative;
  margin: 0 auto;
}
</style>
