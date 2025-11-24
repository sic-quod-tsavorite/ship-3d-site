// Imports
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Project imports
import type { CameraResetState } from "@/interfaces/threeInterfaces";
import {
  KEY_ROTATE_SPEED,
  KEY_ZOOM_SPEED,
  RESET_DURATION,
} from "@/interfaces/threeInterfaces";

export function createOrbitControls(
  camera: THREE.PerspectiveCamera,
  domElement: HTMLElement
): OrbitControls {
  const controls = new OrbitControls(camera, domElement);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 2;
  controls.maxDistance = 80;
  controls.rotateSpeed = 0.3;

  return controls;
}

export function createCameraResetState(): CameraResetState {
  return {
    isResetting: false,
    resetStartTime: 0,
    resetDuration: RESET_DURATION,
    resetStartPosition: new THREE.Vector3(),
    resetStartTarget: new THREE.Vector3(),
    initialPosition: new THREE.Vector3(10, 2, 40),
    initialTarget: new THREE.Vector3(0, 0, 0),
  };
}

export function startCameraReset(
  resetState: CameraResetState,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  time: number
): void {
  if (!resetState.isResetting) {
    resetState.isResetting = true;
    resetState.resetStartTime = time;
    resetState.resetStartPosition.copy(camera.position);
    resetState.resetStartTarget.copy(controls.target);
  }
}

export function updateCameraReset(
  resetState: CameraResetState,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  time: number
): void {
  if (!resetState.isResetting) return;

  const elapsed = time - resetState.resetStartTime;
  const progress = Math.min(elapsed / resetState.resetDuration, 1);

  // Ease-in-out function for smoother animation
  const eased =
    progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;

  // Interpolate camera position and target
  camera.position.lerpVectors(
    resetState.resetStartPosition,
    resetState.initialPosition,
    eased
  );
  controls.target.lerpVectors(
    resetState.resetStartTarget,
    resetState.initialTarget,
    eased
  );
  controls.update();

  // End animation when complete
  if (progress >= 1) {
    resetState.isResetting = false;
  }
}

export function handleKeyboardControls(
  keyState: Set<string>,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  delta: number,
  isResetting: boolean
): void {
  if (keyState.size === 0 || isResetting) return;

  const rotateStep = KEY_ROTATE_SPEED * delta; // radians
  const zoomFactor = Math.pow(0.9, KEY_ZOOM_SPEED * delta);

  // Use spherical math to update camera position around controls.target
  const target = controls.target.clone();
  const offset = camera.position.clone().sub(target);
  const spherical = new THREE.Spherical().setFromVector3(offset);

  // Horizontal orbit: A/D or Left/Right -> adjust theta
  if (keyState.has("a") || keyState.has("arrowleft")) {
    spherical.theta += rotateStep;
  }
  if (keyState.has("d") || keyState.has("arrowright")) {
    spherical.theta -= rotateStep;
  }

  // Vertical orbit: W/S or Up/Down -> adjust phi
  if (keyState.has("w") || keyState.has("arrowup")) {
    spherical.phi -= rotateStep;
  }
  if (keyState.has("s") || keyState.has("arrowdown")) {
    spherical.phi += rotateStep;
  }

  // Zoom in/out with Q / E -> scale radius
  if (keyState.has("e")) {
    spherical.radius *= zoomFactor;
  }
  if (keyState.has("q")) {
    spherical.radius /= zoomFactor;
  }

  // Clamp phi to avoid singularities at poles
  const EPS = 0.000001;
  spherical.phi = Math.max(EPS, Math.min(Math.PI - EPS, spherical.phi));

  // Clamp radius using controls' min/max distance
  spherical.radius = Math.max(
    controls.minDistance,
    Math.min(controls.maxDistance, spherical.radius)
  );

  // Apply new camera position and update controls
  const newPos = new THREE.Vector3().setFromSpherical(spherical).add(target);
  camera.position.copy(newPos);
  controls.update();
}

export function setupKeyboardListeners(
  keyState: Set<string>,
  resetState: CameraResetState,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  getCurrentTime: () => number
): { cleanup: () => void } {
  const onKeyDown = (e: KeyboardEvent): void => {
    const k = e.key.toLowerCase();

    // Handle spacebar for camera reset
    if (k === " ") {
      startCameraReset(resetState, camera, controls, getCurrentTime());
      e.preventDefault();
      return;
    }

    // Keep only the keys we care about
    if (
      [
        "w",
        "a",
        "s",
        "d",
        "q",
        "e",
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright",
      ].includes(k)
    ) {
      keyState.add(k);
      e.preventDefault();
    }
  };

  const onKeyUp = (e: KeyboardEvent): void => {
    keyState.delete(e.key.toLowerCase());
  };

  window.addEventListener("keydown", onKeyDown, { passive: false });
  window.addEventListener("keyup", onKeyUp);

  return {
    cleanup: (): void => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    },
  };
}
