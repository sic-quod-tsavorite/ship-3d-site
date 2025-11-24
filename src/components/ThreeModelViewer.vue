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
import { useThree } from "../modules/useThree";

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
  width: 60%;
  //height: 100%;
  aspect-ratio: 1 / 1;
  min-height: 500px;
  position: relative;
  margin: auto;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(240, 240, 240, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #333;
  z-index: 10;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
