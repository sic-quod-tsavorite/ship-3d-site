import { ref, onMounted, onUnmounted, shallowRef } from "vue";
import type { Ref, ShallowRef } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import { GUI } from "dat.gui";

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
  let composer: EffectComposer | undefined;
  let renderPass: RenderPass | undefined;
  let bloomPass: UnrealBloomPass | undefined;
  let smaaPass: SMAAPass | undefined;
  let fxaaPass: ShaderPass | undefined;
  let gui: GUI | undefined;
  let animationFrameId: number | undefined;
  let prevTime = 0;
  const keyState = new Set<string>();

  // Store initial camera position for reset
  const initialCameraPosition = new THREE.Vector3(10, 2, 40);
  const initialCameraTarget = new THREE.Vector3(0, 0, 0);

  // Camera reset animation state
  let isResetting = false;
  let resetStartTime = 0;
  const resetDuration = 1000; // 1 second in milliseconds
  let resetStartPosition = new THREE.Vector3();
  let resetStartTarget = new THREE.Vector3();

  const init = (): void => {
    if (!container.value) return;

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xebebeb);

    // Camera
    camera = new THREE.PerspectiveCamera(
      70,
      container.value.clientWidth / container.value.clientHeight,
      0.1,
      1000
    );
    camera.position.copy(initialCameraPosition);

    // Renderer
    renderer.value = new THREE.WebGLRenderer({ antialias: true });
    renderer.value.setSize(
      container.value.clientWidth,
      container.value.clientHeight
    );
    renderer.value.setPixelRatio(window.devicePixelRatio);

    // Enable shadows
    renderer.value.shadowMap.enabled = true;
    renderer.value.shadowMap.type = THREE.PCFSoftShadowMap;

    // Configure tone mapping and color space
    renderer.value.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.value.toneMappingExposure = 1.1;
    renderer.value.outputColorSpace = THREE.SRGBColorSpace;

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

    // Post-processing setup
    composer = new EffectComposer(renderer.value);
    renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Bloom pass
    bloomPass = new UnrealBloomPass(
      new THREE.Vector2(
        container.value.clientWidth,
        container.value.clientHeight
      ),
      0.05,
      0.4,
      0.75
    );
    bloomPass.enabled = true;
    composer.addPass(bloomPass);

    // SMAA pass (default AA method)
    smaaPass = new SMAAPass();
    smaaPass.enabled = true;
    composer.addPass(smaaPass);

    // FXAA pass (disabled by default)
    fxaaPass = new ShaderPass(FXAAShader);
    fxaaPass.enabled = false;
    const pixelRatioPP = renderer.value.getPixelRatio();
    const fxaaResolution = fxaaPass.material.uniforms["resolution"].value as {
      x: number;
      y: number;
    };
    fxaaResolution.x = 1 / (container.value.clientWidth * pixelRatioPP);
    fxaaResolution.y = 1 / (container.value.clientHeight * pixelRatioPP);
    composer.addPass(fxaaPass);

    // Keyboard control parameters (alternate control scheme)
    const KEY_ROTATE_SPEED = 1.5; // radians per second
    const KEY_ZOOM_SPEED = 2.5; // arbitrary zoom speed scalar

    // Lighting
    const hemisphereLight = new THREE.HemisphereLight(0xafafaf, 0xafafaf, 5.3);
    scene.add(hemisphereLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

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

    // Add top light to brighten dark textures on top of model
    const topLight = new THREE.DirectionalLight(0xffffff, 0.8);
    topLight.position.set(0, 15, 0);
    scene.add(topLight);

    // Add angled light to illuminate top surfaces from different angle
    const angleLight = new THREE.DirectionalLight(0xffffff, 0.8);
    angleLight.position.set(38, 12, 8);
    scene.add(angleLight);

    // Add subtle fill light
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);

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
            // Enable shadows on mesh
            child.castShadow = true;
            child.receiveShadow = true;

            const materials = Array.isArray(child.material)
              ? child.material
              : [child.material];

            // Enhance materials
            materials.forEach((material: THREE.Material) => {
              material.side = THREE.DoubleSide;

              // Enhance MeshStandardMaterial properties
              if (material instanceof THREE.MeshStandardMaterial) {
                // Set consistent initial values that match GUI defaults
                material.metalness = 0.3;
                material.roughness = 0.7;

                // Add subtle emissive glow to dark materials to lift shadows
                if (material.color.getHSL({ h: 0, s: 0, l: 0 }).l < 0.3) {
                  const emissiveColor = material.color
                    .clone()
                    .multiplyScalar(0.15);
                  material.emissive = emissiveColor;
                  material.emissiveIntensity = 1.0;
                }

                material.needsUpdate = true;
              }
            });
          }
        });

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        if (scene) scene.add(model);

        // Create GUI controls only in development mode
        if (import.meta.env.DEV) {
          gui = new GUI({ autoPlace: false });
          if (container.value) {
            const style = getComputedStyle(container.value);
            if (style.position === "static") {
              container.value.style.position = "relative";
            }
            const el = gui.domElement;
            el.style.position = "absolute";
            el.style.top = "8px";
            el.style.right = "8px";
            el.style.maxHeight = "700px";
            el.style.overflowY = "auto";
            el.style.overflowX = "hidden";
            el.style.pointerEvents = "auto";
            container.value.appendChild(el);
          }

          // Scene controls
          const sceneFolder = gui.addFolder("Scene");
          const sceneParams = { backgroundColor: 0xebebeb };
          sceneFolder
            .addColor(sceneParams, "backgroundColor")
            .onChange((value: number): void => {
              if (scene) scene.background = new THREE.Color(value);
            });
          sceneFolder.open();

          // Hemisphere Light
          const hemiFolder = gui.addFolder("Hemisphere Light");
          hemiFolder
            .add(hemisphereLight, "intensity", 0, 10, 0.1)
            .name("Intensity");
          hemiFolder.addColor(hemisphereLight, "color").name("Sky Color");
          hemiFolder
            .addColor(hemisphereLight, "groundColor")
            .name("Ground Color");
          hemiFolder.open();

          // Ambient Light
          const ambientFolder = gui.addFolder("Ambient Light");
          ambientFolder
            .add(ambientLight, "intensity", 0, 5, 0.1)
            .name("Intensity");
          ambientFolder.addColor(ambientLight, "color").name("Color");
          ambientFolder.open();

          // Directional Light (Main)
          const dirFolder = gui.addFolder("Directional Light (Main)");
          dirFolder
            .add(directionalLight, "intensity", 0, 3, 0.1)
            .name("Intensity");
          dirFolder.addColor(directionalLight, "color").name("Color");
          dirFolder
            .add(directionalLight.position, "x", -20, 20, 0.5)
            .name("Position X");
          dirFolder
            .add(directionalLight.position, "y", 0, 30, 0.5)
            .name("Position Y");
          dirFolder
            .add(directionalLight.position, "z", -20, 20, 0.5)
            .name("Position Z");
          dirFolder.add(directionalLight, "castShadow").name("Cast Shadow");
          const shadowFolder = dirFolder.addFolder("Shadow Settings");
          shadowFolder
            .add(directionalLight.shadow, "bias", -0.01, 0.01, 0.0001)
            .name("Shadow Bias");
          shadowFolder
            .add(directionalLight.shadow, "normalBias", 0, 0.1, 0.001)
            .name("Normal Bias");
          shadowFolder
            .add(directionalLight.shadow.camera, "left", -50, 0, 1)
            .name("Camera Left");
          shadowFolder
            .add(directionalLight.shadow.camera, "right", 0, 50, 1)
            .name("Camera Right");
          shadowFolder
            .add(directionalLight.shadow.camera, "top", 0, 50, 1)
            .name("Camera Top");
          shadowFolder
            .add(directionalLight.shadow.camera, "bottom", -50, 0, 1)
            .name("Camera Bottom");
          dirFolder.open();

          // Top Light
          const topFolder = gui.addFolder("Top Light");
          topFolder.add(topLight, "intensity", 0, 3, 0.1).name("Intensity");
          topFolder.addColor(topLight, "color").name("Color");
          topFolder
            .add(topLight.position, "x", -20, 20, 0.5)
            .name("Position X");
          topFolder.add(topLight.position, "y", 0, 30, 0.5).name("Position Y");
          topFolder
            .add(topLight.position, "z", -20, 20, 0.5)
            .name("Position Z");

          // Angle Light
          const angleFolder = gui.addFolder("Angle Light");
          angleFolder.add(angleLight, "intensity", 0, 3, 0.1).name("Intensity");
          angleFolder.addColor(angleLight, "color").name("Color");
          angleFolder
            .add(angleLight.position, "x", -50, 50, 1)
            .name("Position X");
          angleFolder
            .add(angleLight.position, "y", 0, 30, 0.5)
            .name("Position Y");
          angleFolder
            .add(angleLight.position, "z", -20, 20, 0.5)
            .name("Position Z");

          // Fill Light
          const fillFolder = gui.addFolder("Fill Light");
          fillFolder.add(fillLight, "intensity", 0, 3, 0.1).name("Intensity");
          fillFolder.addColor(fillLight, "color").name("Color");
          fillFolder
            .add(fillLight.position, "x", -20, 20, 0.5)
            .name("Position X");
          fillFolder
            .add(fillLight.position, "y", 0, 30, 0.5)
            .name("Position Y");
          fillFolder
            .add(fillLight.position, "z", -20, 20, 0.5)
            .name("Position Z");

          // Renderer settings
          const rendererFolder = gui.addFolder("Renderer");
          if (renderer.value) {
            rendererFolder
              .add(renderer.value, "toneMappingExposure", 0, 3, 0.1)
              .name("Exposure");
            const rendererParams = {
              shadowMapEnabled: renderer.value.shadowMap.enabled,
            };
            rendererFolder
              .add(rendererParams, "shadowMapEnabled")
              .name("Shadows Enabled")
              .onChange((value: boolean): void => {
                if (renderer.value) renderer.value.shadowMap.enabled = value;
              });
          }
          rendererFolder.open();

          // Post-Processing (AA & Bloom)
          const postFolder = gui.addFolder("Post-Processing");
          const postParams = {
            aaMethod: "SMAA" as "None" | "FXAA" | "SMAA",
            bloomEnabled: true,
            bloomStrength: 0.05,
            bloomRadius: 0.4,
            bloomThreshold: 0.75,
          };
          const applyAAMethod = (): void => {
            if (smaaPass) smaaPass.enabled = postParams.aaMethod === "SMAA";
            if (fxaaPass) fxaaPass.enabled = postParams.aaMethod === "FXAA";
          };
          postFolder
            .add(postParams, "aaMethod", ["None", "FXAA", "SMAA"])
            .name("AA Method")
            .onChange(applyAAMethod);
          const updateBloom = (): void => {
            if (bloomPass) {
              bloomPass.enabled = postParams.bloomEnabled;
              bloomPass.strength = postParams.bloomStrength;
              bloomPass.radius = postParams.bloomRadius;
              bloomPass.threshold = postParams.bloomThreshold;
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
          postFolder.open();

          // Material settings (global adjustments)
          const materialFolder = gui.addFolder("Material Overrides");
          const materialParams = {
            metalness: 0.3,
            roughness: 0.7,
            emissiveMultiplier: 0.15,
            emissiveIntensity: 1.0,
          };
          const updateMaterials = (): void => {
            model.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                const materials = Array.isArray(child.material)
                  ? child.material
                  : [child.material];
                materials.forEach((material: THREE.Material) => {
                  if (material instanceof THREE.MeshStandardMaterial) {
                    material.metalness = materialParams.metalness;
                    material.roughness = materialParams.roughness;
                    if (material.color.getHSL({ h: 0, s: 0, l: 0 }).l < 0.3) {
                      const emissiveColor = material.color
                        .clone()
                        .multiplyScalar(materialParams.emissiveMultiplier);
                      material.emissive = emissiveColor;
                      material.emissiveIntensity =
                        materialParams.emissiveIntensity;
                    }
                    material.needsUpdate = true;
                  }
                });
              }
            });
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

      // Handle smooth camera reset animation
      if (isResetting) {
        const elapsed = time - resetStartTime;
        const progress = Math.min(elapsed / resetDuration, 1);

        // Ease-in-out function for smoother animation
        const eased =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        // Interpolate camera position and target
        camera.position.lerpVectors(
          resetStartPosition,
          initialCameraPosition,
          eased
        );
        controls.target.lerpVectors(
          resetStartTarget,
          initialCameraTarget,
          eased
        );
        controls.update();

        // End animation when complete
        if (progress >= 1) {
          isResetting = false;
        }
      }

      // Handle keyboard-driven alternate controls (WASD / arrows to orbit, Q/E to zoom)
      if (keyState.size > 0 && !isResetting) {
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

      // Render through post-processing composer
      if (composer) {
        composer.render();
      } else {
        renderer.value.render(scene, camera);
      }
    };

    // Handle Resize
    const onWindowResize = (): void => {
      if (!container.value) return;
      if (!camera || !renderer.value) return;

      const width = container.value.clientWidth;
      const height = container.value.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.value.setSize(width, height);

      // Update composer size and pass resolutions
      if (composer) {
        composer.setSize(width, height);
        const pixelRatio = renderer.value.getPixelRatio();

        if (bloomPass) {
          bloomPass.resolution.set(width, height);
        }

        if (fxaaPass?.material.uniforms["resolution"]) {
          const fxaaResolution = fxaaPass.material.uniforms["resolution"]
            .value as { x: number; y: number };
          fxaaResolution.x = 1 / (width * pixelRatio);
          fxaaResolution.y = 1 / (height * pixelRatio);
        }
        // SMAA adjusts internally; no manual update needed.
      }
    };
    window.addEventListener("resize", onWindowResize);

    // Keyboard handlers for alternate control scheme
    const onKeyDown = (e: KeyboardEvent): void => {
      const k = e.key.toLowerCase();

      // Handle spacebar for camera reset
      if (k === " ") {
        if (camera && controls && !isResetting) {
          // Start smooth reset animation
          isResetting = true;
          resetStartTime = performance.now();
          resetStartPosition.copy(camera.position);
          resetStartTarget.copy(controls.target);
        }
        e.preventDefault();
        return;
      }

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

      // Dispose GUI
      if (gui) {
        gui.destroy();
      }

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
