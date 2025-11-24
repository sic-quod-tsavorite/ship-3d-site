// Imports
import type { Ref } from "vue";

// Project imports
import type { QualityLevel } from "@/interfaces/threeInterfaces";
import type { PerformanceTracking } from "@/interfaces/threeInterfaces";
import {
  MAX_FRAME_SAMPLES,
  QUALITY_DEBOUNCE_DURATION,
  STARTUP_CHECK_INTERVAL,
} from "@/interfaces/threeInterfaces";
import {
  applyQualityPreset,
  updateMaterialsForQuality,
} from "./postProcessing";
import { applyLightingForQuality } from "./lighting";
import type { QualityAdjustmentContext } from "@/interfaces/threeInterfaces";

export function createPerformanceTracking(
  currentFPS?: Ref<number>,
  currentQuality?: Ref<QualityLevel>
): PerformanceTracking {
  return {
    frameTimes: [],
    fpsCheckInterval: 0,
    lastQualityChangeTime: 0,
    manualQualityOverride: null,
    startupChecksRemaining: 2, // Check high->medium->low if needed
    startupCheckTime: 0,
    currentFPS,
    currentQuality,
  };
}

export function calculateAverageFPS(frameTimes: number[]): number {
  if (frameTimes.length === 0) return 60; // Default to 60 FPS if no data yet
  const avgFrameTime =
    frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
  return avgFrameTime > 0 ? 1000 / avgFrameTime : 60; // Default to 60 FPS if calculation fails
}

export function updatePerformanceTracking(
  tracking: PerformanceTracking,
  delta: number,
  time: number,
  context: QualityAdjustmentContext
): void {
  if (!tracking.currentFPS || !import.meta.env.DEV) return;

  const frameTime = delta * 1000; // Convert to milliseconds
  tracking.frameTimes.push(frameTime);
  if (tracking.frameTimes.length > MAX_FRAME_SAMPLES) {
    tracking.frameTimes.shift();
  }

  // Update FPS display every 10 frames
  tracking.fpsCheckInterval++;
  if (tracking.fpsCheckInterval >= 10) {
    tracking.fpsCheckInterval = 0;
    const avgFPS = calculateAverageFPS(tracking.frameTimes);
    tracking.currentFPS.value = Math.round(avgFPS);

    // Startup quality checks: high->medium->low if system can't handle it
    // Skip quality adjustments if in degraded mode (no shaders available)
    if (
      !context.isDegradedMode &&
      tracking.startupChecksRemaining > 0 &&
      tracking.manualQualityOverride === null &&
      tracking.currentQuality
    ) {
      handleStartupQualityChecks(tracking, avgFPS, time, context);
    }

    // Auto-adjust quality based on FPS thresholds with debounce (after startup checks)
    // Skip quality adjustments if in degraded mode (no shaders available)
    if (
      !context.isDegradedMode &&
      tracking.currentQuality &&
      tracking.startupChecksRemaining <= 0 &&
      tracking.manualQualityOverride === null
    ) {
      handleDynamicQualityAdjustment(tracking, avgFPS, time, context);
    }
  }
}

function handleStartupQualityChecks(
  tracking: PerformanceTracking,
  avgFPS: number,
  time: number,
  context: QualityAdjustmentContext
): void {
  if (!tracking.currentQuality) return;

  if (tracking.startupCheckTime === 0) {
    tracking.startupCheckTime = time;
  }

  // Check every 2 seconds if we should downgrade quality
  if (time - tracking.startupCheckTime >= STARTUP_CHECK_INTERVAL) {
    if (avgFPS < 45 && tracking.currentQuality.value === "high") {
      // Downgrade from high to medium
      changeQuality("medium", tracking, time, context);
      tracking.startupChecksRemaining--;
      tracking.startupCheckTime = time;
    } else if (avgFPS < 30 && tracking.currentQuality.value === "medium") {
      // Downgrade from medium to low
      changeQuality("low", tracking, time, context);
    }

    tracking.startupChecksRemaining--;
    tracking.startupCheckTime = 0; // Reset for next check
  }
}

function handleDynamicQualityAdjustment(
  tracking: PerformanceTracking,
  avgFPS: number,
  time: number,
  context: QualityAdjustmentContext
): void {
  if (!tracking.currentQuality) return;

  let targetQuality: QualityLevel = tracking.currentQuality.value;

  if (avgFPS < 30) {
    targetQuality = "low";
  } else if (avgFPS < 45) {
    targetQuality = "medium";
  } else {
    targetQuality = "high";
  }

  // Only change quality if debounce duration has passed
  if (
    targetQuality !== tracking.currentQuality.value &&
    time - tracking.lastQualityChangeTime >= QUALITY_DEBOUNCE_DURATION
  ) {
    changeQuality(targetQuality, tracking, time, context);
  }
}

function changeQuality(
  quality: QualityLevel,
  tracking: PerformanceTracking,
  time: number,
  context: QualityAdjustmentContext
): void {
  if (!tracking.currentQuality) return;

  tracking.currentQuality.value = quality;
  tracking.lastQualityChangeTime = time;

  // Apply quality changes
  applyQualityPreset(quality, context.passes);
  applyLightingForQuality(
    quality,
    context.lightReferences,
    context.initialLightSettings
  );
  if (context.model) {
    updateMaterialsForQuality(quality, context.model);
  }

  // Notify external callback
  if (context.onQualityChange) {
    context.onQualityChange(quality);
  }
}

export function setManualQualityOverride(
  tracking: PerformanceTracking,
  quality: QualityLevel,
  context: QualityAdjustmentContext
): void {
  tracking.manualQualityOverride = quality;
  if (tracking.currentQuality) {
    tracking.currentQuality.value = quality;
  }

  // Apply quality changes
  applyQualityPreset(quality, context.passes);
  applyLightingForQuality(
    quality,
    context.lightReferences,
    context.initialLightSettings
  );
  if (context.model) {
    updateMaterialsForQuality(quality, context.model);
  }

  // Notify external callback
  if (context.onQualityChange) {
    context.onQualityChange(quality);
  }
}
