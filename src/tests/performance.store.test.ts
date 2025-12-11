// Imports
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";

// Project imports
import { usePerformanceStore } from "../stores/performance";

describe("Performance Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("initializes with high quality by default", () => {
    const store = usePerformanceStore();
    expect(store.qualityPreset).toBe("high");
  });

  it("persists quality preset to localStorage", () => {
    const store = usePerformanceStore();
    store.setQualityPreset("medium");

    expect(localStorage.getItem("ship3d-quality-preset")).toBe("medium");
    expect(store.qualityPreset).toBe("medium");
  });

  it("loads quality preset from localStorage", () => {
    localStorage.setItem("ship3d-quality-preset", "low");

    const store = usePerformanceStore();
    expect(store.qualityPreset).toBe("low");
  });

  it("ignores invalid stored values", () => {
    localStorage.setItem("ship3d-quality-preset", "invalid");

    const store = usePerformanceStore();
    expect(store.qualityPreset).toBe("high");
  });

  it("updates quality preset correctly", () => {
    const store = usePerformanceStore();

    store.setQualityPreset("medium");
    expect(store.qualityPreset).toBe("medium");

    store.setQualityPreset("low");
    expect(store.qualityPreset).toBe("low");

    store.setQualityPreset("high");
    expect(store.qualityPreset).toBe("high");
  });
});
