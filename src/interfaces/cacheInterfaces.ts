// Imports
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

export interface CachedModel {
  gltf: GLTF;
  loadedAt: number;
}

export interface PreloadStatus {
  isPreloading: boolean;
  progress: number;
}

export interface ModelData {
  path: string;
  data: ArrayBuffer;
  cachedAt: number;
  size: number;
}
