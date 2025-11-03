import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import ThreeModelViewer from "../components/ThreeModelViewer.vue";
import { nextTick } from "vue";

declare global {
  // store the last mocked gltf model for tests
  var _lastGltf: unknown;
}

vi.mock("three", () => {
  class Scene {
    background: unknown = null;
    add(..._args: unknown[]): void {}
  }
  class Color {
    constructor(_hex?: number) {}
  }
  class PerspectiveCamera {
    aspect = 1;
    position = { set: (_x: number, _y: number, _z: number): void => {} };
    constructor(
      _fovy?: number,
      _aspect?: number,
      _near?: number,
      _far?: number
    ) {}
    updateProjectionMatrix(): void {}
  }
  class Vector3 {
    x = 0;
    y = 0;
    z = 0;
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    set(_x: number, _y: number, _z: number): Vector3 {
      return this;
    }
  }
  class Box3 {
    setFromObject(_obj: unknown): { getCenter: (_v: unknown) => Vector3 } {
      return {
        getCenter: (_v: unknown): Vector3 => new Vector3(0, 0, 0),
      };
    }
  }
  class Mesh {
    isMesh = true;
    material: unknown;
    constructor(material: unknown) {
      this.material = material;
    }
  }
  class AmbientLight {
    constructor(_color: unknown, _intensity?: number) {}
  }
  class DirectionalLight {
    position: { set: (x: number, y: number, z: number) => void } = {
      set: () => {},
    };
    constructor(_color: unknown, _intensity?: number) {}
  }
  const DoubleSide = 2;
  class WebGLRenderer {
    domElement: HTMLElement;
    constructor(_opts?: unknown) {
      this.domElement = document.createElement("canvas");
    }
    setSize(_w: number, _h: number): void {}
    setPixelRatio(_r: number): void {}
    render(_scene: unknown, _camera: unknown): void {}
    dispose(): void {}
  }

  return {
    Scene,
    Color,
    PerspectiveCamera,
    Vector3,
    Box3,
    Mesh,
    AmbientLight,
    DirectionalLight,
    WebGLRenderer,
    DoubleSide,
  };
});

vi.mock("three/examples/jsm/controls/OrbitControls.js", () => {
  return {
    OrbitControls: class {
      constructor(_camera: unknown, _dom: unknown) {}
      enableDamping = false;
      dampingFactor = 0;
      screenSpacePanning = false;
      minDistance = 0;
      maxDistance = 0;
      rotateSpeed = 0;
      update(): void {}
      dispose(): void {}
    },
  };
});

vi.mock("three/examples/jsm/loaders/DRACOLoader.js", () => {
  return {
    DRACOLoader: class {
      constructor() {}
      setDecoderPath(_p: string): void {}
    },
  };
});

vi.mock("three/examples/jsm/libs/meshopt_decoder.module.js", () => {
  return {
    MeshoptDecoder: {},
  };
});

vi.mock("three/examples/jsm/loaders/GLTFLoader.js", () => {
  return {
    GLTFLoader: class {
      setDRACOLoader(_d: unknown): void {}
      setMeshoptDecoder(_m: unknown): void {}
      load(
        _modelPath: string,
        onLoad: (gltf: unknown) => void,
        onProgress?: (p: { loaded: number; total: number }) => void,
        _onError?: (err: unknown) => void
      ): void {
        if (typeof onProgress === "function") {
          try {
            onProgress({ loaded: 50, total: 100 });
          } catch (e) {
            console.error(e);
          }
        }
        const meshMaterial = [{ side: 0 }];
        const mesh = { isMesh: true, material: meshMaterial };
        const model = {
          traverse(cb: (obj: unknown) => void): void {
            cb(mesh);
          },
          position: { sub: (_v: unknown): void => {} },
          _mesh: mesh,
        };
        const gltf = { scene: model };
        globalThis._lastGltf = gltf;

        void Promise.resolve().then(() => {
          try {
            onLoad(gltf);
          } catch (e) {
            console.error(e);
          }
        });
      }
    },
  };
});

beforeEach((): void => {
  vi.restoreAllMocks();
  vi.spyOn(window, "addEventListener");
  vi.spyOn(window, "removeEventListener");
  globalThis.requestAnimationFrame = vi.fn(() => 123);
  globalThis.cancelAnimationFrame = vi.fn();
});

afterEach((): void => {
  delete globalThis._lastGltf;
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe("ThreeModelViewer.vue + useThree composable", (): void => {
  it("shows loading overlay with progress before model load and hides after load", async (): Promise<void> => {
    const wrapper = mount(ThreeModelViewer, {
      props: {
        modelPath: "/models/test.gltf",
      },
      attachTo: document.body,
    });

    await nextTick();

    const overlay = wrapper.find(".loading-overlay");
    expect(overlay.exists()).toBe(true);
    expect(overlay.text()).toContain("Loading... 50%");

    await nextTick();
    await nextTick();

    expect(wrapper.find(".loading-overlay").exists()).toBe(false);

    const container = wrapper.find(".model-container").element;
    const canvases = container.getElementsByTagName("canvas");
    expect(canvases.length).toBeGreaterThanOrEqual(1);

    wrapper.unmount();
  });

  it("loads the model successfully", async (): Promise<void> => {
    const wrapper = mount(ThreeModelViewer, {
      props: {
        modelPath: "/models/test.gltf",
      },
      attachTo: document.body,
    });

    await nextTick();
    await nextTick();

    const gltf = globalThis._lastGltf;
    expect(gltf).toBeDefined();

    wrapper.unmount();
  });
});
