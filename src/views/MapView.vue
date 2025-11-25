<template>
  <div class="map-page" ref="mapRef">
    <div class="map-inner" :style="mapInnerStyle">
      <div class="map-image" :style="mapStyle"></div>

      <img
        class="ship"
        :src="shipSrc"
        :style="shipStyle"
        alt="ship"
        @click="onShipClick"
      />

      <div v-if="isZoomed" class="info-on-map" :style="infoStyle">
        <div class="info-card">
          <h3>Ship Detail</h3>
          <p>
            This is some sample text about the ship. It appears when you zoom
            in.
          </p>
          <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem">
            <button
              @click="showModelViewer = true"
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Open 3D View
            </button>
            <button class="close-btn" @click="closeZoom">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div
    v-if="showModelViewer"
    class="popup-overlay"
    @click.self="showModelViewer = false"
  >
    <div class="popup-content">
      <p class="text-center mb-4">
        Venstre klik eller piletaster for at roterer kameraet. Scroll for at
        zoom.
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
// Imports
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

// Project imports
import ThreeModelViewer from "../components/ThreeModelViewer.vue";

const showModelViewer = ref(false);

const dynamic_path =
  import.meta.env.VITE_PATH +
  "optimeret_version_-_standard_vessel_with_LARS.glb";

const mapSrc = "/assets/images/map.png";
const shipSrc = "/assets/images/ship.png";

const mapRef = ref<HTMLElement | null>(null);
const isZoomed = ref(false);
const mapTransform = ref("");
const zoomFactor = ref(2.3);

// Position the ship in percentages relative to the map container
const shipLeft = ref(60); // percent from left
const shipTop = ref(55); // percent from top

const shipStyle = computed(() => ({
  left: shipLeft.value + "%",
  top: shipTop.value + "%",
}));

const mapInnerStyle = computed(() => ({
  transform: isZoomed.value ? mapTransform.value : "",
  transformOrigin: "0 0",
}));

const infoStyle = computed(() => ({
  left: `calc(${shipLeft.value}% + 228px)`,
  top: `calc(${shipTop.value}% - 30px)`,
}));

const mapStyle = computed(() => ({
  backgroundImage: `url(${mapSrc})`,
}));

function computeTransformForShip(): void {
  const el = mapRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const vw = rect.width;
  const vh = rect.height;
  const sx = (shipLeft.value / 100) * vw;
  const sy = (shipTop.value / 100) * vh;
  const z = zoomFactor.value;

  // Compute translate to center ship
  let tx = vw / 2 - sx * z;
  let ty = vh / 2 - sy * z;

  // Map size after scale
  const scaledW = vw * z;
  const scaledH = vh * z;

  // Clamp tx/ty so the scaled map still covers the viewport (no blank edges)
  const minTx = vw - scaledW; // most negative translate allowed
  const maxTx = 0; // most positive translate allowed
  const minTy = vh - scaledH;
  const maxTy = 0;

  if (tx < minTx) tx = minTx;
  if (tx > maxTx) tx = maxTx;
  if (ty < minTy) ty = minTy;
  if (ty > maxTy) ty = maxTy;

  mapTransform.value = `translate(${tx}px, ${ty}px) scale(${z})`;
}

function onShipClick(): void {
  computeTransformForShip();
  isZoomed.value = true;
}

function closeZoom(): void {
  isZoomed.value = false;
  mapTransform.value = "";
}

function onResize(): void {
  if (isZoomed.value) computeTransformForShip();
}

onMounted(() => window.addEventListener("resize", onResize));
onBeforeUnmount(() => window.removeEventListener("resize", onResize));
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

.map-page {
  position: absolute;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  top: 0;
  left: 0;
}

.map-image {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: transform 400ms ease;
}

.map-inner {
  position: absolute;
  inset: 0;
  transition: transform 420ms cubic-bezier(0.2, 0.9, 0.3, 1);
  will-change: transform;
}

.ship {
  position: absolute;
  height: 100px;
  transform: translate(-50%, -50%) scale(0.9);
  transition: all 400ms ease;
  cursor: pointer;
  user-select: none;
}

.ship.zoomed {
  position: fixed;
  left: 50% !important;
  top: 50% !important;
  transform: translate(-50%, -50%) scale(1.6) !important;
  width: 120px !important;
  height: 120px !important;
  z-index: 50;
}

.overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  z-index: 40;
}

.info-card {
  background: white;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  max-width: 360px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  text-align: left;
}

.info-on-map {
  position: absolute;
  transform: translate(-50%, -100%);
  pointer-events: auto;
}

.info-card h3 {
  margin: 0 0 0.5rem 0;
}

.action-btn {
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.close-btn {
  margin-left: 0.5rem;
  padding: 0.45rem 0.6rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* small responsive tweak */
@media (max-width: 640px) {
  .ship.zoomed {
    width: 96px !important;
    height: 96px !important;
  }
}
</style>
