// Imports
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";

// Project imports
import type { PostProcessingPasses } from "@/interfaces/threeInterfaces";
import type { QualityLevel } from "@/interfaces/threeInterfaces";

export function createPostProcessing(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  container: HTMLElement,
  isDegradedMode: boolean,
  onDegradedMode: () => void
): PostProcessingPasses {
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const passes: PostProcessingPasses = {
    composer,
    renderPass,
  };

  // Skip shader initialization in degraded mode
  if (isDegradedMode) {
    console.warn(
      "Graphics degraded mode active - shaders disabled for compatibility"
    );
    return passes;
  }

  // Try to initialize post-processing shaders with fallback to degraded mode

  // Bloom pass
  try {
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      0.05,
      0.4,
      0.75
    );
    bloomPass.enabled = true;
    composer.addPass(bloomPass);
    passes.bloomPass = bloomPass;
  } catch (error) {
    console.warn("Bloom shader compilation failed:", error);
    onDegradedMode();
  }

  // SMAA pass (default AA method)
  try {
    const smaaPass = new SMAAPass();
    smaaPass.enabled = true;
    composer.addPass(smaaPass);
    passes.smaaPass = smaaPass;
  } catch (error) {
    console.warn("SMAA shader compilation failed:", error);
    onDegradedMode();
  }

  // FXAA pass (disabled by default)
  try {
    const fxaaPass = new ShaderPass(FXAAShader);
    fxaaPass.enabled = false;
    const pixelRatioPP = renderer.getPixelRatio();
    const fxaaResolution = fxaaPass.material.uniforms["resolution"].value as {
      x: number;
      y: number;
    };
    fxaaResolution.x = 1 / (container.clientWidth * pixelRatioPP);
    fxaaResolution.y = 1 / (container.clientHeight * pixelRatioPP);
    composer.addPass(fxaaPass);
    passes.fxaaPass = fxaaPass;
  } catch (error) {
    console.warn("FXAA shader compilation failed:", error);
    onDegradedMode();
  }

  return passes;
}

export function applyQualityPreset(
  quality: QualityLevel,
  passes: PostProcessingPasses
): void {
  if (quality === "high") {
    // High: Full quality with SMAA + Bloom
    if (passes.smaaPass) passes.smaaPass.enabled = true;
    if (passes.fxaaPass) passes.fxaaPass.enabled = false;
    if (passes.bloomPass) passes.bloomPass.enabled = true;
  } else if (quality === "medium") {
    // Medium: Switch to FXAA + keep Bloom
    if (passes.smaaPass) passes.smaaPass.enabled = false;
    if (passes.fxaaPass) passes.fxaaPass.enabled = true;
    if (passes.bloomPass) passes.bloomPass.enabled = true;
  } else {
    // Low: Disable AA + Bloom
    if (passes.smaaPass) passes.smaaPass.enabled = false;
    if (passes.fxaaPass) passes.fxaaPass.enabled = false;
    if (passes.bloomPass) passes.bloomPass.enabled = false;
  }
}

export function updateMaterialsForQuality(
  quality: QualityLevel,
  model?: THREE.Object3D
): void {
  if (!model) return;

  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];

      materials.forEach((material: THREE.Material) => {
        if (material instanceof THREE.MeshStandardMaterial) {
          if (quality === "low") {
            // Low quality: turn off metalness and roughness
            material.metalness = 0;
            material.roughness = 0;
          } else {
            // High/Medium: restore original values
            material.metalness = 0.3;
            material.roughness = 0.7;
          }
          material.needsUpdate = true;
        }
      });
    }
  });
}

export function resizePostProcessing(
  passes: PostProcessingPasses,
  width: number,
  height: number,
  pixelRatio: number
): void {
  if (passes.composer) {
    passes.composer.setSize(width, height);
  }

  if (passes.bloomPass) {
    passes.bloomPass.resolution.set(width, height);
  }

  if (passes.fxaaPass?.material.uniforms["resolution"]) {
    const fxaaResolution = passes.fxaaPass.material.uniforms["resolution"]
      .value as { x: number; y: number };
    fxaaResolution.x = 1 / (width * pixelRatio);
    fxaaResolution.y = 1 / (height * pixelRatio);
  }
  // SMAA adjusts internally; no manual update needed.
}
