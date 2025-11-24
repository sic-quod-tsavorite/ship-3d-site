// Imports
import * as THREE from "three";
import { GUI } from "dat.gui";

// Project imports
import type { QualityLevel } from "@/interfaces/threeInterfaces";
import type {
  LightReferences,
  PostProcessingPasses,
  PerformanceParams,
  FPSDisplay,
  GUIContext,
} from "@/interfaces/threeInterfaces";
import { updateModelMaterials } from "./modelLoader";

export function createGUI(context: GUIContext): {
  gui: GUI;
  perfParams?: PerformanceParams;
  fpsDisplay?: FPSDisplay;
} {
  const gui = new GUI({ autoPlace: false });

  // Position GUI in container
  const style = getComputedStyle(context.container);
  if (style.position === "static") {
    context.container.style.position = "relative";
  }
  const el = gui.domElement;
  el.style.position = "absolute";
  el.style.top = "8px";
  el.style.right = "8px";
  el.style.maxHeight = "700px";
  el.style.overflowY = "auto";
  el.style.overflowX = "hidden";
  el.style.pointerEvents = "auto";
  context.container.appendChild(el);

  // Scene controls
  setupSceneFolder(gui, context.scene);

  // Lighting controls
  setupLightingFolders(gui, context.lightReferences, context.ambientLight);

  // Renderer settings
  setupRendererFolder(gui, context.renderer);

  // Post-Processing controls
  setupPostProcessingFolder(gui, context.passes, context.isDegradedMode);

  // Material settings
  if (context.model) {
    setupMaterialFolder(gui, context.model);
  }

  // Performance monitoring (dev mode only)
  let perfParams: PerformanceParams | undefined;
  let fpsDisplay: FPSDisplay | undefined;
  if (context.currentFPS && context.currentQuality) {
    const result = setupPerformanceFolder(gui, context);
    perfParams = result.perfParams;
    fpsDisplay = result.fpsDisplay;
  }

  return { gui, perfParams, fpsDisplay };
}

function setupSceneFolder(gui: GUI, scene: THREE.Scene): void {
  const sceneFolder = gui.addFolder("Scene");
  const sceneParams = { backgroundColor: 0xebebeb };
  sceneFolder
    .addColor(sceneParams, "backgroundColor")
    .onChange((value: number): void => {
      scene.background = new THREE.Color(value);
    });
  sceneFolder.open();
}

function setupLightingFolders(
  gui: GUI,
  lightReferences: LightReferences,
  ambientLight: THREE.AmbientLight
): void {
  // Hemisphere Light
  if (lightReferences.hemisphere) {
    const hemiFolder = gui.addFolder("Hemisphere Light");
    hemiFolder
      .add(lightReferences.hemisphere, "intensity", 0, 10, 0.1)
      .name("Intensity");
    hemiFolder.addColor(lightReferences.hemisphere, "color").name("Sky Color");
    hemiFolder
      .addColor(lightReferences.hemisphere, "groundColor")
      .name("Ground Color");
    hemiFolder.open();
  }

  // Ambient Light
  const ambientFolder = gui.addFolder("Ambient Light");
  ambientFolder.add(ambientLight, "intensity", 0, 5, 0.1).name("Intensity");
  ambientFolder.addColor(ambientLight, "color").name("Color");
  ambientFolder.open();

  // Directional Light (Main)
  if (lightReferences.main) {
    const dirFolder = gui.addFolder("Directional Light (Main)");
    dirFolder
      .add(lightReferences.main, "intensity", 0, 3, 0.1)
      .name("Intensity");
    dirFolder.addColor(lightReferences.main, "color").name("Color");
    dirFolder
      .add(lightReferences.main.position, "x", -20, 20, 0.5)
      .name("Position X");
    dirFolder
      .add(lightReferences.main.position, "y", 0, 30, 0.5)
      .name("Position Y");
    dirFolder
      .add(lightReferences.main.position, "z", -20, 20, 0.5)
      .name("Position Z");
    dirFolder.add(lightReferences.main, "castShadow").name("Cast Shadow");

    const shadowFolder = dirFolder.addFolder("Shadow Settings");
    shadowFolder
      .add(lightReferences.main.shadow, "bias", -0.01, 0.01, 0.0001)
      .name("Shadow Bias");
    shadowFolder
      .add(lightReferences.main.shadow, "normalBias", 0, 0.1, 0.001)
      .name("Normal Bias");
    shadowFolder
      .add(lightReferences.main.shadow.camera, "left", -50, 0, 1)
      .name("Camera Left");
    shadowFolder
      .add(lightReferences.main.shadow.camera, "right", 0, 50, 1)
      .name("Camera Right");
    shadowFolder
      .add(lightReferences.main.shadow.camera, "top", 0, 50, 1)
      .name("Camera Top");
    shadowFolder
      .add(lightReferences.main.shadow.camera, "bottom", -50, 0, 1)
      .name("Camera Bottom");
    dirFolder.open();
  }

  // Top Light
  if (lightReferences.top) {
    const topFolder = gui.addFolder("Top Light");
    topFolder
      .add(lightReferences.top, "intensity", 0, 3, 0.1)
      .name("Intensity");
    topFolder.addColor(lightReferences.top, "color").name("Color");
    topFolder
      .add(lightReferences.top.position, "x", -20, 20, 0.5)
      .name("Position X");
    topFolder
      .add(lightReferences.top.position, "y", 0, 30, 0.5)
      .name("Position Y");
    topFolder
      .add(lightReferences.top.position, "z", -20, 20, 0.5)
      .name("Position Z");
  }

  // Angle Light
  if (lightReferences.angle) {
    const angleFolder = gui.addFolder("Angle Light");
    angleFolder
      .add(lightReferences.angle, "intensity", 0, 3, 0.1)
      .name("Intensity");
    angleFolder.addColor(lightReferences.angle, "color").name("Color");
    angleFolder
      .add(lightReferences.angle.position, "x", -50, 50, 1)
      .name("Position X");
    angleFolder
      .add(lightReferences.angle.position, "y", 0, 30, 0.5)
      .name("Position Y");
    angleFolder
      .add(lightReferences.angle.position, "z", -20, 20, 0.5)
      .name("Position Z");
  }

  // Fill Light
  if (lightReferences.fill) {
    const fillFolder = gui.addFolder("Fill Light");
    fillFolder
      .add(lightReferences.fill, "intensity", 0, 3, 0.1)
      .name("Intensity");
    fillFolder.addColor(lightReferences.fill, "color").name("Color");
    fillFolder
      .add(lightReferences.fill.position, "x", -20, 20, 0.5)
      .name("Position X");
    fillFolder
      .add(lightReferences.fill.position, "y", 0, 30, 0.5)
      .name("Position Y");
    fillFolder
      .add(lightReferences.fill.position, "z", -20, 20, 0.5)
      .name("Position Z");
  }
}

function setupRendererFolder(gui: GUI, renderer: THREE.WebGLRenderer): void {
  const rendererFolder = gui.addFolder("Renderer");
  rendererFolder
    .add(renderer, "toneMappingExposure", 0, 3, 0.1)
    .name("Exposure");
  const rendererParams = {
    shadowMapEnabled: renderer.shadowMap.enabled,
  };
  rendererFolder
    .add(rendererParams, "shadowMapEnabled")
    .name("Shadows Enabled")
    .onChange((value: boolean): void => {
      renderer.shadowMap.enabled = value;
    });
  rendererFolder.open();
}

function setupPostProcessingFolder(
  gui: GUI,
  passes: PostProcessingPasses,
  isDegradedMode: boolean
): void {
  const postFolder = gui.addFolder("Post-Processing");

  if (isDegradedMode) {
    const degradedInfo = { status: "Disabled (Compatibility Mode)" };
    postFolder.add(degradedInfo, "status").name("Status");
  } else {
    const postParams = {
      aaMethod: "SMAA" as "None" | "FXAA" | "SMAA",
      bloomEnabled: true,
      bloomStrength: 0.05,
      bloomRadius: 0.4,
      bloomThreshold: 0.75,
    };

    const applyAAMethod = (): void => {
      if (passes.smaaPass)
        passes.smaaPass.enabled = postParams.aaMethod === "SMAA";
      if (passes.fxaaPass)
        passes.fxaaPass.enabled = postParams.aaMethod === "FXAA";
    };

    postFolder
      .add(postParams, "aaMethod", ["None", "FXAA", "SMAA"])
      .name("AA Method")
      .onChange(applyAAMethod);

    const updateBloom = (): void => {
      if (passes.bloomPass) {
        passes.bloomPass.enabled = postParams.bloomEnabled;
        passes.bloomPass.strength = postParams.bloomStrength;
        passes.bloomPass.radius = postParams.bloomRadius;
        passes.bloomPass.threshold = postParams.bloomThreshold;
      }
    };

    postFolder
      .add(postParams, "bloomEnabled")
      .name("Bloom Enabled")
      .onChange(updateBloom);
    postFolder
      .add(postParams, "bloomStrength", 0, 3, 0.05)
      .name("Bloom Strength")
      .onChange(updateBloom);
    postFolder
      .add(postParams, "bloomRadius", 0, 1, 0.01)
      .name("Bloom Radius")
      .onChange(updateBloom);
    postFolder
      .add(postParams, "bloomThreshold", 0, 1, 0.01)
      .name("Bloom Threshold")
      .onChange(updateBloom);
  }

  postFolder.open();
}

function setupMaterialFolder(gui: GUI, model: THREE.Object3D): void {
  const materialFolder = gui.addFolder("Material Overrides");
  const materialParams = {
    metalness: 0.3,
    roughness: 0.7,
    emissiveMultiplier: 0.15,
    emissiveIntensity: 1.0,
  };

  const updateMaterials = (): void => {
    updateModelMaterials(model, materialParams);
  };

  materialFolder
    .add(materialParams, "metalness", 0, 1, 0.05)
    .name("Metalness")
    .onChange(updateMaterials);
  materialFolder
    .add(materialParams, "roughness", 0, 1, 0.05)
    .name("Roughness")
    .onChange(updateMaterials);
  materialFolder
    .add(materialParams, "emissiveMultiplier", 0, 1, 0.05)
    .name("Emissive Mult")
    .onChange(updateMaterials);
  materialFolder
    .add(materialParams, "emissiveIntensity", 0, 3, 0.1)
    .name("Emissive Int")
    .onChange(updateMaterials);
}

function setupPerformanceFolder(
  gui: GUI,
  context: GUIContext
): { perfParams: PerformanceParams; fpsDisplay: FPSDisplay } {
  if (!context.currentFPS || !context.currentQuality) {
    throw new Error("Performance refs required for performance folder");
  }

  const perfParams: PerformanceParams = {
    currentFPS: 0,
    qualityLevel: context.currentQuality.value,
  };

  const perfFolder = gui.addFolder("Performance");

  // FPS display (read-only text display)
  const fpsDisplay: FPSDisplay = { fps: "0 FPS" };
  perfFolder.add(fpsDisplay, "fps").name("FPS").listen();

  // Degraded mode indicator
  const degradedModeDisplay = {
    mode: context.isDegradedMode ? "Yes" : "No",
  };
  perfFolder.add(degradedModeDisplay, "mode").name("Degraded Mode").listen();

  // Quality level display with manual override
  if (context.isDegradedMode) {
    perfFolder
      .add(perfParams, "qualityLevel", ["low"])
      .name("Quality (Locked)")
      .onChange((value: QualityLevel): void => {
        context.onQualityChange(value);
      });
  } else {
    perfFolder
      .add(perfParams, "qualityLevel", ["low", "medium", "high"])
      .name("Quality Override")
      .onChange((value: QualityLevel): void => {
        context.onQualityChange(value);
      });
  }

  // Reset graphics mode button (only show if in degraded mode)
  if (context.isDegradedMode && context.onResetGraphics) {
    const resetParams = {
      reset: context.onResetGraphics,
    };
    perfFolder.add(resetParams, "reset").name("Reset Graphics Mode");
  }

  perfFolder.open();

  return { perfParams, fpsDisplay };
}

export function updateGUIPerformance(
  perfParams: PerformanceParams | undefined,
  fpsDisplay: FPSDisplay | undefined,
  fps: number,
  quality: QualityLevel
): void {
  if (perfParams) {
    perfParams.currentFPS = fps;
    perfParams.qualityLevel = quality;
  }
  if (fpsDisplay) {
    fpsDisplay.fps = `${fps} FPS`;
  }
}
