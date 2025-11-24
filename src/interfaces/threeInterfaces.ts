// Imports
import type * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import type { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import type { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";
import type { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import type { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import type { GUI } from "dat.gui";
import type { Ref, ShallowRef } from "vue";

// Types
export type QualityLevel = "high" | "medium" | "low";

// Interfaces
export interface LightReferences {
  hemisphere: THREE.HemisphereLight | null;
  main: THREE.DirectionalLight | null;
  top: THREE.DirectionalLight | null;
  angle: THREE.DirectionalLight | null;
  fill: THREE.DirectionalLight | null;
}

export interface LightSettings {
  hemisphere: { intensity: number };
  ambient: { intensity: number };
  directional: { intensity: number; castShadow: boolean };
  top: { intensity: number };
  angle: { intensity: number };
  fill: { intensity: number };
}

export interface PostProcessingPasses {
  composer?: EffectComposer;
  renderPass?: RenderPass;
  bloomPass?: UnrealBloomPass;
  smaaPass?: SMAAPass;
  fxaaPass?: ShaderPass;
}

export interface ThreeContext {
  renderer: ShallowRef<THREE.WebGLRenderer | undefined>;
  scene?: THREE.Scene;
  camera?: THREE.PerspectiveCamera;
  controls?: OrbitControls;
  gui?: GUI;
  animationFrameId?: number;
}

export interface CameraResetState {
  isResetting: boolean;
  resetStartTime: number;
  resetDuration: number;
  resetStartPosition: THREE.Vector3;
  resetStartTarget: THREE.Vector3;
  initialPosition: THREE.Vector3;
  initialTarget: THREE.Vector3;
}

export interface PerformanceTracking {
  frameTimes: number[];
  fpsCheckInterval: number;
  lastQualityChangeTime: number;
  manualQualityOverride: QualityLevel | null;
  startupChecksRemaining: number;
  startupCheckTime: number;
  currentFPS?: Ref<number>;
  currentQuality?: Ref<QualityLevel>;
}

export interface RecoveryState {
  recoveryAttempts: number;
  loadTimeoutHandle?: ReturnType<typeof setTimeout>;
  gltfAbortController?: AbortController;
}

export interface PerformanceParams {
  currentFPS: number;
  qualityLevel: QualityLevel;
}

export interface FPSDisplay {
  fps: string;
}

export interface SceneSetupResult {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
}

export interface QualityAdjustmentContext {
  passes: PostProcessingPasses;
  lightReferences: LightReferences;
  initialLightSettings: LightSettings;
  model?: THREE.Object3D;
  isDegradedMode: boolean;
  onQualityChange?: (quality: QualityLevel) => void;
}

export interface ModelLoadCallbacks {
  onProgress: (progress: number) => void;
  onLoad: (model: THREE.Object3D) => void;
  onError: (error: unknown) => void;
  onTimeout: () => void;
}

export interface GUIContext {
  container: HTMLElement;
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  lightReferences: LightReferences;
  ambientLight: THREE.AmbientLight;
  passes: PostProcessingPasses;
  model?: THREE.Object3D;
  isDegradedMode: boolean;
  currentFPS?: Ref<number>;
  currentQuality?: Ref<QualityLevel>;
  onQualityChange: (quality: QualityLevel) => void;
  onResetGraphics?: () => void;
}

// Constants
export const MAX_FRAME_SAMPLES = 60;
export const QUALITY_DEBOUNCE_DURATION = 2000; // 2 seconds in milliseconds
export const MAX_RECOVERY_ATTEMPTS = 2;
export const STARTUP_CHECK_INTERVAL = 2000; // 2 seconds between checks
export const LOAD_TIMEOUT_MS = 8000; // 8 seconds
export const KEY_ROTATE_SPEED = 1.5; // radians per second
export const KEY_ZOOM_SPEED = 2.5; // arbitrary zoom speed scalar
export const RESET_DURATION = 1000; // 1 second in milliseconds
