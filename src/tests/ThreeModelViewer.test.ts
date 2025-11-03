import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import ThreeModelViewer from "../components/ThreeModelViewer.vue";
import { nextTick } from "vue";

vi.mock("three", () => {
  class Scene {
    background: any = null;
    add(..._args: any[]) {}
  }
  class Color {
    constructor(_hex?: number) {}
  }
  class PerspectiveCamera {
    aspect = 1;
    position = { set: (_x: number, _y: number, _z: number) => {} };
    constructor(
      _fovy?: number,
      _aspect?: number,
      _near?: number,
      _far?: number
    ) {}
    updateProjectionMatrix() {}
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
    set(_x: number, _y: number, _z: number) {
      return this;
    }
  }
  class Box3 {
    setFromObject(_obj: any) {
      return {
        getCenter: (_v: any) => new Vector3(0, 0, 0),
      };
    }
  }
  class Mesh {
    isMesh = true;
    material: any;
    constructor(material: any) {
      this.material = material;
    }
  }
  class AmbientLight {
    constructor(_color: any, _intensity?: number) {}
  }
  class DirectionalLight {
    position: { set: (x: number, y: number, z: number) => void } = {
      set: () => {},
    };
    constructor(_color: any, _intensity?: number) {}
  }
  const DoubleSide = 2;
  class WebGLRenderer {
    domElement: HTMLElement;
    constructor(_opts?: any) {
      this.domElement = document.createElement("canvas");
    }
    setSize(_w: number, _h: number) {}
    setPixelRatio(_r: number) {}
    render(_scene: any, _camera: any) {}
    dispose() {}
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
      constructor(_camera: any, _dom: any) {}
      enableDamping = false;
      dampingFactor = 0;
      screenSpacePanning = false;
      minDistance = 0;
      maxDistance = 0;
      rotateSpeed = 0;
      update() {}
      dispose() {}
    },
  };
});

vi.mock("three/examples/jsm/loaders/DRACOLoader.js", () => {
  return {
    DRACOLoader: class {
      constructor() {}
      setDecoderPath(_p: string) {}
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
      setDRACOLoader(_d: any) {}
      setMeshoptDecoder(_m: any) {}
      load(
        modelPath: string,
        onLoad: Function,
        onProgress?: Function,
        onError?: Function
      ) {
        if (typeof onProgress === "function") {
          try {
            onProgress({ loaded: 50, total: 100 });
          } catch (e) {}
        }
        const meshMaterial = [{ side: 0 }];
        const mesh = { isMesh: true, material: meshMaterial };
        const model = {
          traverse(cb: Function) {
            cb(mesh);
          },
          position: { sub: (_v: any) => {} },
          _mesh: mesh,
        };
        const gltf = { scene: model };
        (globalThis as any)._lastGltf = gltf;

        Promise.resolve().then(() => {
          try {
            onLoad(gltf);
          } catch (e) {}
        });

        // no typescript error >-<
        if (modelPath + onError == "0") {
          console.log("something");
        }
      }
    },
  };
});

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(window, "addEventListener");
  vi.spyOn(window, "removeEventListener");
  (globalThis as any).requestAnimationFrame = vi.fn(() => 123);
  (globalThis as any).cancelAnimationFrame = vi.fn();
});

afterEach(() => {
  delete (globalThis as any)._lastGltf;
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe("ThreeModelViewer.vue + useThree composable", () => {
  it("shows loading overlay with progress before model load and hides after load", async () => {
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

  it("loads the model successfully", async () => {
    const wrapper = mount(ThreeModelViewer, {
      props: {
        modelPath: "/models/test.gltf",
      },
      attachTo: document.body,
    });

    await nextTick();
    await nextTick();

    const gltf = (globalThis as any)._lastGltf;
    expect(gltf).toBeDefined();

    wrapper.unmount();
  });
});
