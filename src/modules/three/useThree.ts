// Imports
import { ref, onMounted, onUnmounted, shallowRef, nextTick } from "vue";
import type { Ref } from "vue";
import * as THREE from "three";

// Project imports
import { usePerformanceStore } from "@/stores/performance";
import { useModelCacheStore } from "@/stores/modelCache";
import {
  createScene,
  createCamera,
  createRenderer,
  setupContextLossHandlers,
  handleWindowResize,
} from "./sceneSetup";
import { createLights } from "./lighting";
import {
  createPostProcessing,
  applyQualityPreset,
  updateMaterialsForQuality,
  resizePostProcessing,
} from "./postProcessing";
import { setupModelLoader } from "./modelLoader";
import {
  createOrbitControls,
  createCameraResetState,
  updateCameraReset,
  handleKeyboardControls,
  setupKeyboardListeners,
} from "./controls";
import {
  createPerformanceTracking,
  updatePerformanceTracking,
  setManualQualityOverride,
} from "./performance";
import { createGUI, updateGUIPerformance } from "./gui";
import type {
  LightReferences,
  LightSettings,
  PostProcessingPasses,
  PerformanceParams,
  FPSDisplay,
  RecoveryState,
  QualityAdjustmentContext,
  QualityLevel,
} from "@/interfaces/threeInterfaces";
import {
  MAX_RECOVERY_ATTEMPTS,
  LOAD_TIMEOUT_MS,
} from "@/interfaces/threeInterfaces";

export function useThree(
  container: Ref<HTMLElement | null>,
  modelPath: string
): {
  isLoading: Ref<boolean>;
  loadingProgress: Ref<number>;
  currentFPS?: Ref<number>;
  currentQuality?: Ref<QualityLevel>;
} {
  const modelCacheStore = useModelCacheStore();
  const isInMemoryCache = modelCacheStore.hasSync(modelPath);

  const isLoading = ref<boolean>(!isInMemoryCache);
  const loadingProgress = ref<number>(isInMemoryCache ? 100 : 0);
  const loadStartTime = ref<number>(0);
  const currentFPS = import.meta.env.DEV ? ref<number>(0) : undefined;

  // Get performance store and load saved quality preset
  const performanceStore = usePerformanceStore();
  const currentQuality = import.meta.env.DEV
    ? ref<QualityLevel>(performanceStore.qualityPreset)
    : undefined;

  const renderer = shallowRef<THREE.WebGLRenderer>();
  let scene: THREE.Scene | undefined;
  let camera: THREE.PerspectiveCamera | undefined;
  let controls: ReturnType<typeof createOrbitControls> | undefined;
  let animationFrameId: number | undefined;
  let prevTime = 0;
  const keyState = new Set<string>();

  // Module state
  let lightReferences: LightReferences | undefined;
  let initialLightSettings: LightSettings | undefined;
  let postProcessingPasses: PostProcessingPasses = {};
  let resetState = createCameraResetState();
  let performanceTracking = createPerformanceTracking(
    currentFPS,
    currentQuality
  );
  let perfParams: PerformanceParams | undefined;
  let fpsDisplay: FPSDisplay | undefined;
  let gui: ReturnType<typeof createGUI>["gui"] | undefined;
  let model: THREE.Object3D | undefined;
  let ambientLight: THREE.AmbientLight | undefined;
  let keyboardCleanup: (() => void) | undefined;

  // Recovery and crash handling
  const recoveryState: RecoveryState = {
    recoveryAttempts: 0,
    loadTimeoutHandle: undefined,
    gltfAbortController: undefined,
  };

  // Helper to clean up and dispose resources
  const cleanupRenderer = (): void => {
    if (animationFrameId !== undefined) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = undefined;
    }

    if (recoveryState.loadTimeoutHandle !== undefined) {
      clearTimeout(recoveryState.loadTimeoutHandle);
      recoveryState.loadTimeoutHandle = undefined;
    }

    if (recoveryState.gltfAbortController) {
      recoveryState.gltfAbortController.abort();
      recoveryState.gltfAbortController = undefined;
    }

    if (
      postProcessingPasses.composer &&
      typeof postProcessingPasses.composer.dispose === "function"
    ) {
      postProcessingPasses.composer.dispose();
    }
    renderer.value?.dispose();
    controls?.dispose();

    gui?.destroy();

    if (keyboardCleanup) {
      keyboardCleanup();
      keyboardCleanup = undefined;
    }

    postProcessingPasses = {};
    renderer.value = undefined;
    scene = undefined;
    camera = undefined;
    controls = undefined;
    gui = undefined;
  };

  // Helper to schedule recovery after crash
  const scheduleRecovery = (): void => {
    if (recoveryState.recoveryAttempts >= MAX_RECOVERY_ATTEMPTS) {
      console.error(
        "Max recovery attempts reached. 3D viewer unavailable on this device."
      );
      isLoading.value = false;
      return;
    }

    recoveryState.recoveryAttempts++;
    console.warn(
      `Recovery attempt ${recoveryState.recoveryAttempts}/${MAX_RECOVERY_ATTEMPTS}`
    );

    // Clean up existing state
    cleanupRenderer();

    // Force degraded mode for recovery
    performanceStore.setDegradedMode(true);
    if (currentQuality) {
      currentQuality.value = "low";
    }
    performanceStore.setQualityPreset("low");

    // Clear container
    if (container.value) {
      container.value.innerHTML = "";
    }

    // Retry init after brief delay
    setTimeout(() => {
      init();
    }, 500);
  };

  const init = (): void => {
    if (!container.value) return;

    // Track when loading starts
    loadStartTime.value = performance.now();

    // Create scene, camera, and renderer
    scene = createScene();
    camera = createCamera(container.value);
    renderer.value = createRenderer(
      container.value,
      performanceStore.isDegradedMode,
      recoveryState
    );

    container.value.appendChild(renderer.value.domElement);

    // Setup context loss handlers for crash recovery
    setupContextLossHandlers(renderer.value, scheduleRecovery);

    // Create controls
    controls = createOrbitControls(camera, renderer.value.domElement);

    // Create lighting
    const lightingResult = createLights(scene);
    lightReferences = lightingResult.lightReferences;
    initialLightSettings = lightingResult.initialSettings;
    ambientLight = lightingResult.ambientLight;

    // Setup post-processing
    const onDegradedMode = (): void => {
      performanceStore.setDegradedMode(true);
      if (currentQuality) {
        currentQuality.value = "low";
      }
      performanceStore.setQualityPreset("low");
    };

    postProcessingPasses = createPostProcessing(
      renderer.value,
      scene,
      camera,
      container.value,
      performanceStore.isDegradedMode,
      onDegradedMode
    );

    // Setup keyboard controls
    keyboardCleanup = setupKeyboardListeners(
      keyState,
      resetState,
      camera,
      controls,
      () => performance.now()
    ).cleanup;

    // Load model
    const { abortController, timeoutHandle } = setupModelLoader(
      modelPath,
      scene,
      {
        onProgress: (progress) => {
          loadingProgress.value = progress;
        },
        onLoad: (loadedModel) => {
          model = loadedModel;

          // Clear timeout since load succeeded
          clearTimeout(timeoutHandle);

          // Create GUI controls only in development mode
          if (
            import.meta.env.DEV &&
            ambientLight &&
            lightReferences &&
            initialLightSettings &&
            scene &&
            renderer.value &&
            container.value
          ) {
            const capturedLightReferences = lightReferences;
            const capturedLightSettings = initialLightSettings;

            const guiResult = createGUI({
              container: container.value,
              scene,
              renderer: renderer.value,
              lightReferences,
              ambientLight,
              passes: postProcessingPasses,
              model,
              isDegradedMode: performanceStore.isDegradedMode,
              currentFPS,
              currentQuality,
              onQualityChange: (quality: QualityLevel): void => {
                const context: QualityAdjustmentContext = {
                  passes: postProcessingPasses,
                  lightReferences: capturedLightReferences,
                  initialLightSettings: capturedLightSettings,
                  model,
                  isDegradedMode: performanceStore.isDegradedMode,
                  onQualityChange: (q: QualityLevel): void => {
                    performanceStore.setQualityPreset(q);
                    if (perfParams) {
                      perfParams.qualityLevel = q;
                    }
                  },
                };
                setManualQualityOverride(performanceTracking, quality, context);
              },
              onResetGraphics: (): void => {
                performanceStore.setDegradedMode(false);
                alert(
                  "Graphics mode reset. Please reload the page for changes to take effect."
                );
              },
            });
            gui = guiResult.gui;
            perfParams = guiResult.perfParams;
            fpsDisplay = guiResult.fpsDisplay;
          }

          // Apply stored quality preset on load
          if (currentQuality) {
            applyQualityPreset(currentQuality.value, postProcessingPasses);
            updateMaterialsForQuality(currentQuality.value, model);
          }

          // Ensure progress shows 100% before hiding loading overlay
          loadingProgress.value = 100;

          // Calculate load time to detect instant memory cache hits
          const loadDuration = performance.now() - loadStartTime.value;
          const isInstantLoad = loadDuration < 200; // Memory cache hit

          if (isInstantLoad || isInMemoryCache) {
            // Instant load from memory cache - no delay needed
            isLoading.value = false;
            prevTime = performance.now();
            animate(prevTime);
          } else {
            // Slower load (IndexedDB/network) - show 100% briefly for confirmation
            void nextTick(() => {
              setTimeout(() => {
                isLoading.value = false;
                prevTime = performance.now();
                animate(prevTime);
              }, 250);
            });
          }
        },
        onError: (error) => {
          console.error("An error happened while loading the model:", error);
          isLoading.value = false;
        },
        onTimeout: (): void => {
          if (isLoading.value && loadingProgress.value === 0) {
            console.warn("Model loading stuck at 0% - triggering recovery");
            abortController.abort();
            scheduleRecovery();
          }
        },
      },
      LOAD_TIMEOUT_MS
    );

    recoveryState.gltfAbortController = abortController;
    recoveryState.loadTimeoutHandle = timeoutHandle;
  };

  // Animation Loop
  const animate = (time = performance.now()): void => {
    try {
      if (!scene || !camera || !controls || !renderer.value) return;

      const delta = Math.max(0, (time - prevTime) / 1000);
      prevTime = time;

      // Update performance tracking and quality adjustment
      if (lightReferences && initialLightSettings) {
        const context: QualityAdjustmentContext = {
          passes: postProcessingPasses,
          lightReferences,
          initialLightSettings,
          model,
          isDegradedMode: performanceStore.isDegradedMode,
          onQualityChange: (quality: QualityLevel): void => {
            performanceStore.setQualityPreset(quality);
            if (perfParams) {
              perfParams.qualityLevel = quality;
            }
          },
        };

        updatePerformanceTracking(performanceTracking, delta, time, context);

        // Update GUI FPS display
        if (currentFPS && currentQuality) {
          updateGUIPerformance(
            perfParams,
            fpsDisplay,
            currentFPS.value,
            currentQuality.value
          );
        }
      }

      // Handle smooth camera reset animation
      updateCameraReset(resetState, camera, controls, time);

      // Handle keyboard-driven alternate controls
      handleKeyboardControls(
        keyState,
        camera,
        controls,
        delta,
        resetState.isResetting
      );

      animationFrameId = requestAnimationFrame(animate);
      controls.update();

      // Render through post-processing composer or direct render
      if (postProcessingPasses.composer) {
        postProcessingPasses.composer.render();
      } else {
        renderer.value.render(scene, camera);
      }
    } catch (error) {
      console.error("Animation loop error - triggering recovery:", error);
      scheduleRecovery();
    }
  };

  // Handle Resize
  const onWindowResize = (): void => {
    if (!container.value || !camera || !renderer.value) return;

    handleWindowResize(
      container.value,
      camera,
      renderer.value,
      (width, height, pixelRatio) => {
        resizePostProcessing(postProcessingPasses, width, height, pixelRatio);
      }
    );
  };

  onMounted(() => {
    init();
    window.addEventListener("resize", onWindowResize);
  });

  // Cleanup on unmount
  onUnmounted(() => {
    cleanupRenderer();
    window.removeEventListener("resize", onWindowResize);
  });

  return {
    isLoading,
    loadingProgress,
    ...(currentFPS && { currentFPS }),
    ...(currentQuality && { currentQuality }),
  } as {
    isLoading: Ref<boolean>;
    loadingProgress: Ref<number>;
    currentFPS?: Ref<number>;
    currentQuality?: Ref<QualityLevel>;
  };
}
