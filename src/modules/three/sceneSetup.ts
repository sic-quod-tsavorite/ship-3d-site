// Imports
import * as THREE from "three";

// Project imports
import type { RecoveryState } from "@/interfaces/threeInterfaces";

export function createScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xebebeb);
  return scene;
}

export function createCamera(container: HTMLElement): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(
    70,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(10, 2, 40);
  return camera;
}

export function createRenderer(
  container: HTMLElement,
  isDegradedMode: boolean,
  recoveryState: RecoveryState
): THREE.WebGLRenderer {
  const useDefaultRenderer =
    !isDegradedMode && recoveryState.recoveryAttempts === 0;

  const renderer = new THREE.WebGLRenderer({
    antialias: useDefaultRenderer,
    powerPreference:
      recoveryState.recoveryAttempts > 0 ? "low-power" : "default",
  });

  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Enable shadows only in non-degraded mode
  const shouldUseShadows =
    !isDegradedMode && recoveryState.recoveryAttempts === 0;
  renderer.shadowMap.enabled = shouldUseShadows;
  if (shouldUseShadows) {
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  // Configure tone mapping and color space
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  return renderer;
}

export function setupContextLossHandlers(
  renderer: THREE.WebGLRenderer,
  onRecovery: () => void
): void {
  const onContextLost = (event: Event): void => {
    event.preventDefault();
    console.warn("WebGL context lost - attempting recovery...");
    onRecovery();
  };

  const onContextRestored = (): void => {
    console.log("WebGL context restored");
  };

  renderer.domElement.addEventListener(
    "webglcontextlost",
    onContextLost,
    false
  );
  renderer.domElement.addEventListener(
    "webglcontextrestored",
    onContextRestored,
    false
  );
}

export function handleWindowResize(
  container: HTMLElement,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  onResize?: (width: number, height: number, pixelRatio: number) => void
): void {
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);

  // Notify caller for additional resize handling (e.g., composer, passes)
  if (onResize) {
    const pixelRatio = renderer.getPixelRatio();
    onResize(width, height, pixelRatio);
  }
}
