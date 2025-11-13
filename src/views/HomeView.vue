<template>
  <h1 class="text-3xl font-bold underline text-center my-8">Velkommen!</h1>
  <p class="text-center mb-4">
    Tryk på knappen nedenfor for at åbne 3D-visningen.
  </p>
  <div class="text-center">
    <button
      @click="showModelViewer = true"
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Open 3D View
    </button>
  </div>

  <div
    v-if="showModelViewer"
    class="popup-overlay"
    @click.self="showModelViewer = false"
  >
    <div class="popup-content">
      <p class="text-center mb-4">
        Venstre klik for at roterer kameraet. Højre klik eller piletaster for at
        panorerer kameraet. Scroll for at zoom.
      </p>
      <ThreeModelViewer
        :model-path="dynamic_path"
        class="outline drop-shadow-2xl"
      />
      <button @click="showModelViewer = false" class="close-button">
        Close
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ThreeModelViewer from "../components/ThreeModelViewer.vue";

const showModelViewer = ref(false);

const dynamic_path =
  import.meta.env.VITE_PATH +
  "optimeret_version_-_standard_vessel_with_LARS.glb";
</script>

<style lang="scss" scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-content {
  background: #d8d8d8;
  padding: 20px;
  border-radius: 5px;
  position: relative;
  width: 90vw;
  height: 90vh;
  display: flex;
  flex-direction: column;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff4d4d;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}

.close-button:hover {
  background: #ff1a1a;
}
</style>
