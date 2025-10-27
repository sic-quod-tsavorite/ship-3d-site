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
) {
  const isLoading = ref<boolean>(true);
  const loadingProgress = ref<number>(0);

  const renderer: ShallowRef<THREE.WebGLRenderer | undefined> = shallowRef();
  let scene: THREE.Scene | undefined;
  let camera: THREE.PerspectiveCamera | undefined;
  let controls: OrbitControls | undefined;
  let animationFrameId: number | undefined;

  const init = () => {
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
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 2;
    controls.maxDistance = 80;
    controls.rotateSpeed = 0.3;

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
          const mesh = child as THREE.Mesh;
          if (mesh.isMesh) {
            const materials = Array.isArray(mesh.material)
              ? mesh.material
              : [mesh.material];
            // Render texture on both sides of mesh
            materials.forEach((material: THREE.Material) => {
              material.side = THREE.DoubleSide;
            });
          }
        });

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        scene!.add(model);

        isLoading.value = false;
        animate();
      },
      // Progress Callback (for loading)
      (xhr) => {
        if (xhr.total > 0) {
          loadingProgress.value = Math.round((xhr.loaded / xhr.total) * 100);
        }
      },
      (error) => {
        console.error("An error happened while loading the model:", error);
        isLoading.value = false;
      }
    );

    // Animation Loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      // Controls, renderer and camera are set when init runs and model loads
      controls!.update();
      renderer.value!.render(scene!, camera!);
    };

    // Handle Resize
    const onWindowResize = () => {
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

    // Cleanup on unmount
    onUnmounted(() => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", onWindowResize);

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
