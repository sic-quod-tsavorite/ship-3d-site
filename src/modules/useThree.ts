import { ref, onMounted, onUnmounted, shallowRef } from "vue";
import type { Ref, ShallowRef } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

export function useThree(
  container: Ref<HTMLElement | null>,
  modelPath: string
): {
  isLoading: Ref<boolean>;
  loadingProgress: Ref<number>;
} {
  const isLoading = ref<boolean>(true);
  const loadingProgress = ref<number>(0);

  const renderer: ShallowRef<THREE.WebGLRenderer | undefined> = shallowRef();
  let scene: THREE.Scene | undefined;
  let camera: THREE.PerspectiveCamera | undefined;
  let controls: OrbitControls | undefined;
  let animationFrameId: number | undefined;
  let prevTime = 0;
  const keyState = new Set<string>();

  const init = (): void => {
    if (!container.value) return;

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Camera
    camera = new THREE.PerspectiveCamera(
      70,
      container.value.clientWidth / container.value.clientHeight,
      0.1,
      1000
    );
    camera.position.set(10, 2, 40);

    // Renderer
    renderer.value = new THREE.WebGLRenderer({ antialias: true });
    renderer.value.setSize(
      container.value.clientWidth,
      container.value.clientHeight
    );
    renderer.value.setPixelRatio(window.devicePixelRatio);
    container.value.appendChild(renderer.value.domElement);

    // Controls
    controls = new OrbitControls(camera, renderer.value.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 2;
    controls.maxDistance = 80;
    controls.rotateSpeed = 0.3;

    // Keyboard control parameters (alternate control scheme)
    const KEY_ROTATE_SPEED = 1.5; // radians per second
    const KEY_ZOOM_SPEED = 2.5; // arbitrary zoom speed scalar

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Model Loading
    const dracoLoader: DRACOLoader = new DRACOLoader();

    const gltfLoader: GLTFLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);
    gltfLoader.setMeshoptDecoder(MeshoptDecoder);

    gltfLoader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;

        model.traverse((child) => {
          // Narrow to Mesh to access material/isMesh safely
          if (child instanceof THREE.Mesh) {
            const materials = Array.isArray(child.material)
              ? child.material
              : [child.material];
            // Render texture on both sides of mesh
            materials.forEach((material: THREE.Material) => {
              material.side = THREE.DoubleSide;
            });
          }
        });

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        if (!scene) return;
        scene.add(model);

        isLoading.value = false;
        // initialize time for smooth keyboard motion
        prevTime = performance.now();
        animate(prevTime);
      },
      // Progress Callback (for loading)
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
            loadingProgress.value = Math.round(progress * 100);
          }
        }
      },
      (error) => {
        console.error("An error happened while loading the model:", error);
        isLoading.value = false;
      }
    );

    // Animation Loop
    const animate = (time = performance.now()): void => {
      if (!scene || !camera || !controls || !renderer.value) return;

      const delta = Math.max(0, (time - prevTime) / 1000);
      prevTime = time;

      // Handle keyboard-driven alternate controls (WASD / arrows to orbit, Q/E to zoom)
      if (keyState.size > 0) {
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
        const newPos = new THREE.Vector3()
          .setFromSpherical(spherical)
          .add(target);
        camera.position.copy(newPos);
        controls.update();
      }

      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.value.render(scene, camera);
    };

    // Handle Resize
    const onWindowResize = (): void => {
      if (!container.value) return;
      if (!camera || !renderer.value) return;
      camera.aspect =
        container.value.clientWidth / container.value.clientHeight;
      camera.updateProjectionMatrix();
      renderer.value.setSize(
        container.value.clientWidth,
        container.value.clientHeight
      );
    };
    window.addEventListener("resize", onWindowResize);

    // Keyboard handlers for alternate control scheme
    const onKeyDown = (e: KeyboardEvent): void => {
      const k = e.key.toLowerCase();
      // keep only the keys we care about
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

    // Cleanup on unmount
    onUnmounted(() => {
      if (
        typeof animationFrameId === "number" &&
        !Number.isNaN(animationFrameId)
      ) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener("resize", onWindowResize);

      // remove keyboard handlers
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);

      renderer.value?.dispose();
      controls?.dispose();
    });
  };

  onMounted(init);

  return { isLoading, loadingProgress } as {
    isLoading: Ref<boolean>;
    loadingProgress: Ref<number>;
  };
}
