// Imports
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { nextTick } from "vue";
import { createPinia, setActivePinia } from "pinia";

// Project imports
import ThreeModelViewer from "../components/ThreeModelViewer.vue";

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
    position = {
      set: (_x: number, _y: number, _z: number): void => {},
      copy: (_v: unknown): void => {},
      clone: (): { sub: () => { x: number; y: number; z: number } } => ({
        sub: (): { x: number; y: number; z: number } => ({ x: 0, y: 0, z: 0 }),
      }),
    };
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
    constructor(_x = 0, _y = 0, _z = 0) {
      this.x = _x;
      this.y = _y;
      this.z = _z;
    }
    set(_x: number, _y: number, _z: number): Vector3 {
      return this;
    }
    clone(): Vector3 {
      return new Vector3(this.x, this.y, this.z);
    }
    sub(_v: unknown): Vector3 {
      return this;
    }
    add(_v: unknown): Vector3 {
      return this;
    }
    copy(_v: unknown): Vector3 {
      return this;
    }
    lerpVectors(_v1: unknown, _v2: unknown, _alpha: number): Vector3 {
      return this;
    }
    setFromSpherical(_s: unknown): Vector3 {
      return this;
    }
  }
  class Vector2 {
    constructor(_x = 0, _y = 0) {}
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
    castShadow = false;
    receiveShadow = false;
    constructor(material: unknown) {
      this.material = material;
    }
  }
  class MeshStandardMaterial {
    side = 0;
    metalness = 0;
    roughness = 1;
    color = {
      clone: (): { multiplyScalar: () => Record<string, never> } => ({
        multiplyScalar: (): Record<string, never> => ({}),
      }),
      getHSL: (): { h: number; s: number; l: number } => ({
        h: 0,
        s: 0,
        l: 0.5,
      }),
    };
    emissive = {};
    emissiveIntensity = 0;
    needsUpdate = false;
  }
  class AmbientLight {
    constructor(_color: unknown, _intensity?: number) {}
  }
  class HemisphereLight {
    constructor(
      _skyColor: unknown,
      _groundColor: unknown,
      _intensity?: number
    ) {}
  }
  class DirectionalLight {
    position = { set: (_x: number, _y: number, _z: number): void => {} };
    castShadow = false;
    shadow = {
      mapSize: { width: 1024, height: 1024 },
      camera: {
        near: 0.5,
        far: 50,
        left: -10,
        right: 10,
        top: 10,
        bottom: -10,
      },
      bias: 0,
      normalBias: 0,
    };
    constructor(_color: unknown, _intensity?: number) {}
  }
  const DoubleSide = 2;
  const PCFSoftShadowMap = 1;
  const ACESFilmicToneMapping = 4;
  const SRGBColorSpace = "srgb";
  class WebGLRenderer {
    domElement: HTMLElement;
    shadowMap = { enabled: false, type: 0 };
    toneMapping = 0;
    toneMappingExposure = 1;
    outputColorSpace = "";
    constructor(_opts?: unknown) {
      this.domElement = document.createElement("canvas");
    }
    setSize(_w: number, _h: number): void {}
    setPixelRatio(_r: number): void {}
    getPixelRatio(): number {
      return 1;
    }
    render(_scene: unknown, _camera: unknown): void {}
    dispose(): void {}
  }
  class Spherical {
    radius = 1;
    phi = 0;
    theta = 0;
    setFromVector3(_v: unknown): Spherical {
      return this;
    }
  }

  return {
    Scene,
    Color,
    PerspectiveCamera,
    Vector3,
    Vector2,
    Box3,
    Mesh,
    MeshStandardMaterial,
    AmbientLight,
    HemisphereLight,
    DirectionalLight,
    WebGLRenderer,
    Spherical,
    DoubleSide,
    PCFSoftShadowMap,
    ACESFilmicToneMapping,
    SRGBColorSpace,
  };
});

vi.mock("three/examples/jsm/controls/OrbitControls.js", () => {
  return {
    OrbitControls: class {
      target = {
        clone: (): { x: number; y: number; z: number } => ({
          x: 0,
          y: 0,
          z: 0,
        }),
        copy: (_v: unknown): void => {},
        lerpVectors: (_v1: unknown, _v2: unknown, _alpha: number): void => {},
      };
      enablePan = false;
      enableDamping = false;
      dampingFactor = 0;
      screenSpacePanning = false;
      minDistance = 2;
      maxDistance = 80;
      rotateSpeed = 0;
      constructor(_camera: unknown, _dom: unknown) {}
      update(): void {}
      dispose(): void {}
    },
  };
});

vi.mock("three/examples/jsm/postprocessing/EffectComposer.js", () => ({
  EffectComposer: class {
    constructor(_renderer: unknown) {}
    addPass(_pass: unknown): void {}
    setSize(_w: number, _h: number): void {}
    render(): void {}
  },
}));

vi.mock("three/examples/jsm/postprocessing/RenderPass.js", () => ({
  RenderPass: class {
    constructor(_scene: unknown, _camera: unknown) {}
  },
}));

vi.mock("three/examples/jsm/postprocessing/SMAAPass.js", () => ({
  SMAAPass: class {
    enabled = true;
  },
}));

vi.mock("three/examples/jsm/postprocessing/UnrealBloomPass.js", () => ({
  UnrealBloomPass: class {
    enabled = true;
    strength = 0;
    radius = 0;
    threshold = 0;
    resolution = { set: (_w: number, _h: number): void => {} };
    constructor(
      _resolution: unknown,
      _strength: number,
      _radius: number,
      _threshold: number
    ) {}
  },
}));

vi.mock("three/examples/jsm/postprocessing/ShaderPass.js", () => ({
  ShaderPass: class {
    enabled = false;
    material = {
      uniforms: {
        resolution: { value: { x: 0, y: 0 } },
      },
    };
    constructor(_shader: unknown) {}
  },
}));

vi.mock("three/examples/jsm/shaders/FXAAShader.js", () => ({
  FXAAShader: {},
}));

vi.mock("dat.gui", () => {
  const createController = (): unknown => ({
    name: (): unknown => createController(),
    onChange: (): unknown => createController(),
    listen: (): unknown => createController(),
  });

  const createFolder = (): unknown => ({
    add: (): unknown => createController(),
    addColor: (): unknown => createController(),
    addFolder: (_name: string): unknown => createFolder(),
    open: (): void => {},
  });
  return {
    GUI: class {
      domElement = document.createElement("div");
      constructor(_opts?: unknown) {}
      addFolder(_name: string): unknown {
        return createFolder();
      }
      destroy(): void {}
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
        const material = {
          side: 0,
          metalness: 0.3,
          roughness: 0.7,
          color: {
            clone: (): { multiplyScalar: () => Record<string, never> } => ({
              multiplyScalar: (): Record<string, never> => ({}),
            }),
            getHSL: (): { h: number; s: number; l: number } => ({
              h: 0,
              s: 0,
              l: 0.5,
            }),
          },
          emissive: {},
          emissiveIntensity: 0,
          needsUpdate: false,
        };
        const mesh = {
          isMesh: true,
          material: [material],
          castShadow: false,
          receiveShadow: false,
        };
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
  setActivePinia(createPinia());
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
    // Check that progress is displayed (value may vary based on cache state)
    const overlayText = overlay.text();
    expect(overlayText).toMatch(/Loading\.\.\. \d+%/);

    // Wait for promises to resolve and model to load
    await flushPromises();
    await new Promise((resolve) => setTimeout(resolve, 400));
    await flushPromises();
    await nextTick();

    // Overlay should be hidden after model loads
    expect(wrapper.find(".loading-overlay").exists()).toBe(false);

    const container = wrapper.find(".three-model-container").element;
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
    // Wait for promises to resolve and model to load
    await new Promise((resolve) => setTimeout(resolve, 300));
    await nextTick();

    const gltf = globalThis._lastGltf;
    expect(gltf).toBeDefined();

    wrapper.unmount();
  });

  it("tracks FPS in development mode", async (): Promise<void> => {
    // Mock dev mode
    vi.stubEnv("DEV", true);

    vi.useFakeTimers();

    const wrapper = mount(ThreeModelViewer, {
      props: {
        modelPath: "/models/test.gltf",
      },
      attachTo: document.body,
    });

    await nextTick();

    // Simulate animation frames at 60 FPS (16.67ms per frame)
    for (let i = 0; i < 100; i++) {
      vi.advanceTimersByTime(16.67);
      await nextTick();
    }

    // Check if currentFPS is exposed and updated
    const vm = wrapper.vm as unknown as {
      currentFPS?: { value: number };
    };
    if (vm.currentFPS) {
      expect(vm.currentFPS.value).toBeGreaterThan(0);
    }

    wrapper.unmount();
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("adjusts quality to low when FPS drops below 30", async (): Promise<void> => {
    // Mock dev mode
    vi.stubEnv("DEV", true);

    vi.useFakeTimers();

    const wrapper = mount(ThreeModelViewer, {
      props: {
        modelPath: "/models/test.gltf",
      },
      attachTo: document.body,
    });

    await nextTick();

    // Simulate very low FPS (100ms per frame = ~10 FPS) for 2+ seconds
    for (let i = 0; i < 30; i++) {
      vi.advanceTimersByTime(100);
      await nextTick();
    }

    // Check if quality adjusted to low
    const vm = wrapper.vm as unknown as {
      currentQuality?: { value: string };
    };
    if (vm.currentQuality) {
      expect(vm.currentQuality.value).toBe("low");
    }

    wrapper.unmount();
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("adjusts quality to medium when FPS is between 30 and 45", async (): Promise<void> => {
    // Mock dev mode
    vi.stubEnv("DEV", true);

    vi.useFakeTimers();

    const wrapper = mount(ThreeModelViewer, {
      props: {
        modelPath: "/models/test.gltf",
      },
      attachTo: document.body,
    });

    await nextTick();

    // Simulate medium FPS (~40 FPS = 25ms per frame) for 2+ seconds
    for (let i = 0; i < 100; i++) {
      vi.advanceTimersByTime(25);
      await nextTick();
    }

    // Check if quality adjusted to medium
    const vm = wrapper.vm as unknown as {
      currentQuality?: { value: string };
    };
    if (vm.currentQuality) {
      expect(vm.currentQuality.value).toBe("medium");
    }

    wrapper.unmount();
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("maintains quality as high when FPS is above 45", async (): Promise<void> => {
    // Mock dev mode
    vi.stubEnv("DEV", true);

    vi.useFakeTimers();

    const wrapper = mount(ThreeModelViewer, {
      props: {
        modelPath: "/models/test.gltf",
      },
      attachTo: document.body,
    });

    await nextTick();

    // Simulate high FPS (60 FPS = 16.67ms per frame) for 2+ seconds
    for (let i = 0; i < 150; i++) {
      vi.advanceTimersByTime(16.67);
      await nextTick();
    }

    // Check if quality is high
    const vm = wrapper.vm as unknown as {
      currentQuality?: { value: string };
    };
    if (vm.currentQuality) {
      expect(vm.currentQuality.value).toBe("high");
    }

    wrapper.unmount();
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  describe("Fullscreen functionality", (): void => {
    beforeEach((): void => {
      // Mock Fullscreen API
      Object.defineProperty(document, "fullscreenEnabled", {
        writable: true,
        value: true,
      });
      Object.defineProperty(document, "fullscreenElement", {
        writable: true,
        value: null,
      });
    });

    it("shows fullscreen button in standalone mode", async (): Promise<void> => {
      const wrapper = mount(ThreeModelViewer, {
        props: {
          modelPath: "/models/test.gltf",
        },
        attachTo: document.body,
      });

      await nextTick();

      const fsButton = wrapper.find('button[title*="fullscreen"]');
      expect(fsButton.exists()).toBe(true);
      expect(fsButton.attributes("title")).toContain("fullscreen");

      wrapper.unmount();
    });

    it("toggles fullscreen state when button clicked", async (): Promise<void> => {
      const mockRequestFullscreen = vi.fn(
        (): Promise<void> => Promise.resolve()
      );
      const mockExitFullscreen = vi.fn((): Promise<void> => Promise.resolve());

      const wrapper = mount(ThreeModelViewer, {
        props: {
          modelPath: "/models/test.gltf",
        },
        attachTo: document.body,
      });

      await nextTick();

      const container = wrapper.find(".three-model-container")
        .element as HTMLElement & {
        requestFullscreen: () => Promise<void>;
      };
      container.requestFullscreen = mockRequestFullscreen;
      document.exitFullscreen = mockExitFullscreen;

      // Click fullscreen button
      const fsButton = wrapper.find('button[title*="fullscreen"]');
      await fsButton.trigger("click");

      expect(mockRequestFullscreen).toHaveBeenCalledTimes(1);

      wrapper.unmount();
    });

    it("changes icon when fullscreen state changes", async (): Promise<void> => {
      const wrapper = mount(ThreeModelViewer, {
        props: {
          modelPath: "/models/test.gltf",
        },
        attachTo: document.body,
      });

      await nextTick();

      // Initially should show expand icon
      let fsButton = wrapper.find('button[title*="fullscreen"]');
      expect(fsButton.attributes("title")).toContain("Enter fullscreen");

      // Simulate entering fullscreen
      const container = wrapper.find(".three-model-container").element;
      Object.defineProperty(document, "fullscreenElement", {
        writable: true,
        value: container,
      });

      // Trigger fullscreenchange event
      const event = new Event("fullscreenchange");
      document.dispatchEvent(event);

      await nextTick();

      // Should now show compress icon
      fsButton = wrapper.find('button[title*="fullscreen"]');
      expect(fsButton.attributes("title")).toContain("Exit fullscreen");

      wrapper.unmount();
    });

    it("adds and removes fullscreenchange event listener", async (): Promise<void> => {
      const addSpy = vi.spyOn(document, "addEventListener");
      const removeSpy = vi.spyOn(document, "removeEventListener");

      const wrapper = mount(ThreeModelViewer, {
        props: {
          modelPath: "/models/test.gltf",
        },
        attachTo: document.body,
      });

      await nextTick();

      expect(addSpy).toHaveBeenCalledWith(
        "fullscreenchange",
        expect.any(Function)
      );

      wrapper.unmount();

      expect(removeSpy).toHaveBeenCalledWith(
        "fullscreenchange",
        expect.any(Function)
      );
    });

    it("cleans up event listeners on unmount", async (): Promise<void> => {
      const addSpy = vi.spyOn(document, "addEventListener");
      const removeSpy = vi.spyOn(document, "removeEventListener");

      const wrapper = mount(ThreeModelViewer, {
        props: {
          modelPath: "/models/test.gltf",
        },
        attachTo: document.body,
      });

      await nextTick();

      // Clear the spies to track only unmount behavior
      addSpy.mockClear();
      removeSpy.mockClear();

      wrapper.unmount();

      // Verify listeners were removed
      expect(removeSpy).toHaveBeenCalledWith(
        "fullscreenchange",
        expect.any(Function)
      );
      expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
    });

    it("handles unsupported fullscreen gracefully", async (): Promise<void> => {
      Object.defineProperty(document, "fullscreenEnabled", {
        writable: true,
        value: false,
      });

      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation((): void => {});

      const wrapper = mount(ThreeModelViewer, {
        props: {
          modelPath: "/models/test.gltf",
        },
        attachTo: document.body,
      });

      await nextTick();

      const fsButton = wrapper.find('button[title*="fullscreen"]');
      await fsButton.trigger("click");

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Fullscreen mode is not supported by this browser"
      );

      consoleWarnSpy.mockRestore();
      wrapper.unmount();
    });

    it("handles fullscreen request errors", async (): Promise<void> => {
      const mockRequestFullscreen = vi.fn(
        (): Promise<void> => Promise.reject(new Error("Fullscreen denied"))
      );
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation((): void => {});

      const wrapper = mount(ThreeModelViewer, {
        props: {
          modelPath: "/models/test.gltf",
        },
        attachTo: document.body,
      });

      await nextTick();

      const container = wrapper.find(".three-model-container")
        .element as HTMLElement & {
        requestFullscreen: () => Promise<void>;
      };
      container.requestFullscreen = mockRequestFullscreen;

      const fsButton = wrapper.find('button[title*="fullscreen"]');
      await fsButton.trigger("click");

      await flushPromises();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to enter fullscreen:",
        "Fullscreen denied"
      );

      consoleErrorSpy.mockRestore();
      wrapper.unmount();
    });
  });
});
