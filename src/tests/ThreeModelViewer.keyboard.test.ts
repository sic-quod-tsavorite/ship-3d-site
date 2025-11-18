import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import ThreeModelViewer from "@/components/ThreeModelViewer.vue";
import { nextTick } from "vue";

vi.mock("three", (): Record<string, unknown> => {
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
    set(_x: number, _y: number, _z: number): Vector3 {
      return this;
    }
  }
  class Box3 {
    setFromObject(_obj: unknown): { getCenter: (_v: unknown) => Vector3 } {
      return { getCenter: (_v: unknown): Vector3 => new Vector3() };
    }
  }
  class Mesh {
    constructor(public material: unknown) {}
  }
  class AmbientLight {
    constructor(_c: unknown, _i?: number) {}
  }
  class DirectionalLight {
    position = { set: (_x: number, _y: number, _z: number): void => {} };
    constructor(_c: unknown, _i?: number) {}
  }
  const DoubleSide = 2;
  class WebGLRenderer {
    domElement: HTMLElement;
    constructor(_opts?: unknown) {
      this.domElement = document.createElement("canvas");
    }
    setSize(_w: number, _h: number): void {}
    setPixelRatio(_r: number): void {}
    render(_s: unknown, _c: unknown): void {}
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

vi.mock(
  "three/examples/jsm/controls/OrbitControls.js",
  (): Record<string, unknown> => ({
    OrbitControls: class {
      enablePan = false;
      enableDamping = false;
      dampingFactor = 0;
      screenSpacePanning = false;
      minDistance = 1;
      maxDistance = 100;
      rotateSpeed = 0.3;
      constructor(_c: unknown, _d: unknown) {}
      update(): void {}
      dispose(): void {}
    },
  })
);

vi.mock(
  "three/examples/jsm/loaders/DRACOLoader.js",
  (): Record<string, unknown> => ({
    DRACOLoader: class {},
  })
);
vi.mock(
  "three/examples/jsm/libs/meshopt_decoder.module.js",
  (): Record<string, unknown> => ({
    MeshoptDecoder: {},
  })
);

vi.mock(
  "three/examples/jsm/loaders/GLTFLoader.js",
  (): Record<string, unknown> => ({
    GLTFLoader: class {
      setDRACOLoader(_d: unknown): void {}
      setMeshoptDecoder(_m: unknown): void {}
      load(
        _p: string,
        onLoad: (g: unknown) => void,
        _onP?: unknown,
        _onE?: unknown
      ): void {
        const meshMaterial = [{ side: 0 }];
        const mesh = { isMesh: true, material: meshMaterial };
        const model = {
          traverse: (cb: (o: unknown) => void): void => cb(mesh),
          position: { sub: (_v: unknown): void => {} },
        };
        const gltf = { scene: model };
        void Promise.resolve().then(() => onLoad(gltf));
      }
    },
  })
);

let addSpy: ReturnType<typeof vi.spyOn>;
let removeSpy: ReturnType<typeof vi.spyOn>;

beforeEach((): void => {
  vi.restoreAllMocks();
  addSpy = vi.spyOn(window, "addEventListener");
  removeSpy = vi.spyOn(window, "removeEventListener");
  globalThis.requestAnimationFrame = vi.fn(() => 123);
  globalThis.cancelAnimationFrame = vi.fn();
});

afterEach((): void => {
  vi.clearAllMocks();
});

describe("ThreeModelViewer – keyboard navigation hooks", (): void => {
  it("adds non-passive keydown listener and prevents default for arrows", async (): Promise<void> => {
    const wrapper = mount(ThreeModelViewer, {
      props: { modelPath: "/models/test.gltf" },
      attachTo: document.body,
    });

    await nextTick();
    await nextTick();

    // addEventListener called with passive:false for keydown
    const calls: unknown[][] = (
      addSpy as unknown as { mock: { calls: unknown[][] } }
    ).mock.calls;
    const hasNonPassiveKeydown: boolean = calls.some(
      (c: unknown[]): boolean =>
        c[0] === "keydown" &&
        typeof c[2] === "object" &&
        (c[2] as AddEventListenerOptions).passive === false
    );
    expect(hasNonPassiveKeydown).toBe(true);

    // Dispatch a cancelable event and ensure preventDefault is called
    const ev = new KeyboardEvent("keydown", {
      key: "ArrowRight",
      bubbles: true,
      cancelable: true,
    });
    const preventedBefore = ev.defaultPrevented;
    window.dispatchEvent(ev);
    expect(preventedBefore).toBe(false);
    expect(ev.defaultPrevented).toBe(true);

    wrapper.unmount();

    // ensure listeners cleaned up
    const removeCalls: unknown[][] = (
      removeSpy as { mock: { calls: unknown[][] } }
    ).mock.calls;
    const removedKeydown: boolean = removeCalls.some(
      (c: unknown[]): boolean => c[0] === "keydown"
    );
    const removedKeyup: boolean = removeCalls.some(
      (c: unknown[]): boolean => c[0] === "keyup"
    );
    expect(removedKeydown).toBe(true);
    expect(removedKeyup).toBe(true);
  });
});
