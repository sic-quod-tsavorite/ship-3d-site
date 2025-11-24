// Imports
import * as THREE from "three";

// Project imports
import type {
  LightReferences,
  LightSettings,
} from "@/interfaces/threeInterfaces";
import type { QualityLevel } from "@/interfaces/threeInterfaces";

export function createLights(scene: THREE.Scene): {
  lightReferences: LightReferences;
  initialSettings: LightSettings;
  ambientLight: THREE.AmbientLight;
} {
  // Hemisphere Light
  const hemisphereLight = new THREE.HemisphereLight(0xafafaf, 0xafafaf, 5.3);
  scene.add(hemisphereLight);

  // Ambient Light
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
  scene.add(ambientLight);

  // Main Directional Light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
  directionalLight.position.set(5, 10, 7);
  directionalLight.castShadow = true;

  // Configure shadow properties
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -30;
  directionalLight.shadow.camera.right = 10;
  directionalLight.shadow.camera.top = 10;
  directionalLight.shadow.camera.bottom = -50;
  directionalLight.shadow.bias = -0.0001;
  directionalLight.shadow.normalBias = 0.02;

  scene.add(directionalLight);

  // Top Light - brightens dark textures on top of model
  const topLight = new THREE.DirectionalLight(0xffffff, 0.8);
  topLight.position.set(0, 15, 0);
  scene.add(topLight);

  // Angled Light - illuminates top surfaces from different angle
  const angleLight = new THREE.DirectionalLight(0xffffff, 0.8);
  angleLight.position.set(38, 12, 8);
  scene.add(angleLight);

  // Fill Light - subtle fill light
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
  fillLight.position.set(-5, 3, -5);
  scene.add(fillLight);

  const lightReferences: LightReferences = {
    hemisphere: hemisphereLight,
    main: directionalLight,
    top: topLight,
    angle: angleLight,
    fill: fillLight,
  };

  const initialSettings: LightSettings = {
    hemisphere: { intensity: 5.3 },
    ambient: { intensity: 1.4 },
    directional: { intensity: 1.8, castShadow: true },
    top: { intensity: 0.8 },
    angle: { intensity: 0.8 },
    fill: { intensity: 0.8 },
  };

  return { lightReferences, initialSettings, ambientLight };
}

export function applyLightingForQuality(
  quality: QualityLevel,
  lightReferences: LightReferences,
  initialSettings: LightSettings
): void {
  if (quality === "high" || quality === "medium") {
    // High/Medium: Full lighting
    if (lightReferences.hemisphere) {
      lightReferences.hemisphere.intensity =
        initialSettings.hemisphere.intensity;
    }
    if (lightReferences.main) {
      lightReferences.main.intensity = initialSettings.directional.intensity;
    }
    if (lightReferences.top) {
      lightReferences.top.intensity = initialSettings.top.intensity;
    }
    if (lightReferences.angle) {
      lightReferences.angle.intensity = initialSettings.angle.intensity;
    }
    if (lightReferences.fill) {
      lightReferences.fill.intensity = initialSettings.fill.intensity;
    }
  } else {
    // Low: Disable all directional lights and hemisphere light, keep only ambient
    if (lightReferences.hemisphere) lightReferences.hemisphere.intensity = 0;
    if (lightReferences.main) lightReferences.main.intensity = 0;
    if (lightReferences.top) lightReferences.top.intensity = 0;
    if (lightReferences.angle) lightReferences.angle.intensity = 0;
    if (lightReferences.fill) lightReferences.fill.intensity = 0;
  }
}
