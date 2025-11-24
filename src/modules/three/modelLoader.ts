// Imports
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

// Project imports
import type { ModelLoadCallbacks } from "@/interfaces/threeInterfaces";

export function setupModelLoader(
  modelPath: string,
  scene: THREE.Scene,
  callbacks: ModelLoadCallbacks,
  loadTimeoutMs: number
): {
  abortController: AbortController;
  timeoutHandle: ReturnType<typeof setTimeout>;
} {
  const dracoLoader = new DRACOLoader();
  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.setMeshoptDecoder(MeshoptDecoder);

  const abortController = new AbortController();

  // Set up timeout watchdog to detect stuck loading
  const timeoutHandle = setTimeout(() => {
    callbacks.onTimeout();
  }, loadTimeoutMs);

  gltfLoader.load(
    modelPath,
    (gltf) => {
      clearTimeout(timeoutHandle);
      const model = gltf.scene;

      // Prepare model materials and shadows
      prepareModel(model);

      // Center model in scene
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      scene.add(model);

      callbacks.onLoad(model);
    },
    (xhr) => {
      if (
        typeof xhr.total === "number" &&
        typeof xhr.loaded === "number" &&
        xhr.total > 0 &&
        !Number.isNaN(xhr.total) &&
        !Number.isNaN(xhr.loaded)
      ) {
        const progress = xhr.loaded / xhr.total;
        if (
          typeof progress === "number" &&
          progress >= 0 &&
          progress <= 1 &&
          !Number.isNaN(progress)
        ) {
          callbacks.onProgress(Math.round(progress * 100));
        }
      }
    },
    (error) => {
      callbacks.onError(error);
    }
  );

  return { abortController, timeoutHandle };
}

function prepareModel(model: THREE.Object3D): void {
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      // Enable shadows on mesh
      child.castShadow = true;
      child.receiveShadow = true;

      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];

      // Enhance materials
      materials.forEach((material: THREE.Material) => {
        material.side = THREE.DoubleSide;

        // Enhance MeshStandardMaterial properties
        if (material instanceof THREE.MeshStandardMaterial) {
          // Set consistent initial values that match GUI defaults
          material.metalness = 0.3;
          material.roughness = 0.7;

          // Add subtle emissive glow to dark materials to lift shadows
          if (material.color.getHSL({ h: 0, s: 0, l: 0 }).l < 0.3) {
            const emissiveColor = material.color.clone().multiplyScalar(0.15);
            material.emissive = emissiveColor;
            material.emissiveIntensity = 1.0;
          }

          material.needsUpdate = true;
        }
      });
    }
  });
}

export function updateModelMaterials(
  model: THREE.Object3D,
  params: {
    metalness: number;
    roughness: number;
    emissiveMultiplier: number;
    emissiveIntensity: number;
  }
): void {
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];

      materials.forEach((material: THREE.Material) => {
        if (material instanceof THREE.MeshStandardMaterial) {
          material.metalness = params.metalness;
          material.roughness = params.roughness;
          if (material.color.getHSL({ h: 0, s: 0, l: 0 }).l < 0.3) {
            const emissiveColor = material.color
              .clone()
              .multiplyScalar(params.emissiveMultiplier);
            material.emissive = emissiveColor;
            material.emissiveIntensity = params.emissiveIntensity;
          }
          material.needsUpdate = true;
        }
      });
    }
  });
}
