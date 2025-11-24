// Imports
import { defineStore } from "pinia";
import { ref } from "vue";
import type { QualityLevel } from "@/interfaces/threeInterfaces";

const STORAGE_KEY = "ship3d-quality-preset";
const DEGRADED_MODE_KEY = "ship3d-degraded-mode";

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

  // Load degraded mode state from localStorage
  const storedDegradedMode = localStorage.getItem(DEGRADED_MODE_KEY);
  const isDegradedMode = ref<boolean>(storedDegradedMode === "true");

  function setQualityPreset(quality: QualityLevel): void {
    qualityPreset.value = quality;
    localStorage.setItem(STORAGE_KEY, quality);
  }

  function setDegradedMode(value: boolean): void {
    isDegradedMode.value = value;
    localStorage.setItem(DEGRADED_MODE_KEY, value.toString());
  }

  return {
    qualityPreset,
    setQualityPreset,
    isDegradedMode,
    setDegradedMode,
  };
});
