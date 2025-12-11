// Imports
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useImageLoadingStore = defineStore("imageLoading", () => {
  const _vesselImageLoaded = ref<boolean>(false);

  const vesselImageLoaded = computed((): boolean => _vesselImageLoaded.value);

  const setVesselImageLoaded = (loaded: boolean): void => {
    _vesselImageLoaded.value = loaded;
  };

  return {
    vesselImageLoaded,
    setVesselImageLoaded,
  };
});
