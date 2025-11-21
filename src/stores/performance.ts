import { defineStore } from "pinia";
import { ref } from "vue";

export type QualityLevel = "high" | "medium" | "low";

const STORAGE_KEY = "ship3d-quality-preset";

export const usePerformanceStore = defineStore("performance", () => {
  // Load from localStorage or default to "high"
  const storedQuality = localStorage.getItem(
    STORAGE_KEY
  ) as QualityLevel | null;
  const qualityPreset = ref<QualityLevel>(
    storedQuality && ["high", "medium", "low"].includes(storedQuality)
      ? storedQuality
      : "high"
  );

  function setQualityPreset(quality: QualityLevel): void {
    qualityPreset.value = quality;
    localStorage.setItem(STORAGE_KEY, quality);
  }

  return {
    qualityPreset,
    setQualityPreset,
  };
});
