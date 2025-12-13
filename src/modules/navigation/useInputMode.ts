import { ref, onUnmounted } from "vue";
import type { Ref } from "vue";

export interface UseInputModeReturn {
  isTouchMode: Ref<boolean>;
}

export const useInputMode = (): UseInputModeReturn => {
  // Initial detection based on pointer media query (detects coarse/touch-capable devices)
  let initialTouchMode = false;
  if (typeof window !== "undefined") {
    try {
      initialTouchMode = window.matchMedia("(pointer: coarse)").matches;
    } catch {
      // Fallback if matchMedia is not supported or throws
      initialTouchMode = false;
    }
  }

  const isTouchMode = ref(initialTouchMode);

  // Track last touch time to filter synthetic mouse events
  // (Touch events can trigger mouse events within 300-500ms)
  let lastTouchTime = 0;
  const SYNTHETIC_EVENT_THRESHOLD = 500; // ms

  // Debouncing to prevent rapid mode switching
  let modeChangeTimeout: ReturnType<typeof setTimeout> | null = null;
  const DEBOUNCE_DELAY = 100; // ms

  // Set touch mode with debouncing
  const setTouchMode = (touchMode: boolean): void => {
    if (modeChangeTimeout) {
      clearTimeout(modeChangeTimeout);
    }

    modeChangeTimeout = setTimeout(() => {
      isTouchMode.value = touchMode;
      modeChangeTimeout = null;
    }, DEBOUNCE_DELAY);
  };

  // Handle touch start - switch to touch mode
  const handleTouchStart = (): void => {
    lastTouchTime = Date.now();
    setTouchMode(true);
  };

  // Handle mouse move - switch to mouse mode only if not a synthetic event
  const handleMouseMove = (): void => {
    const timeSinceLastTouch = Date.now() - lastTouchTime;

    // Only switch to mouse mode if enough time has passed since last touch
    // (filters out synthetic mouse events triggered by touch)
    if (timeSinceLastTouch > SYNTHETIC_EVENT_THRESHOLD) {
      setTouchMode(false);
    }
  };

  // Handle pointer events for more precise detection
  const handlePointerDown = (e: PointerEvent): void => {
    if (e.pointerType === "touch") {
      lastTouchTime = Date.now();
      setTouchMode(true);
    } else if (e.pointerType === "mouse") {
      setTouchMode(false);
    }
    // "pen" pointer type - treat as mouse (fine pointer)
    else if (e.pointerType === "pen") {
      setTouchMode(false);
    }
  };

  // Setup event listeners
  const setupListeners = (): void => {
    // Use touchstart for broad touch detection
    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });

    // Use mousemove as fallback (filtered by synthetic event detection)
    document.addEventListener("mousemove", handleMouseMove, {
      passive: true,
    });

    // Use pointerdown for precise detection when available
    document.addEventListener("pointerdown", handlePointerDown);
  };

  // Cleanup listeners on unmount
  const cleanupListeners = (): void => {
    document.removeEventListener("touchstart", handleTouchStart);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("pointerdown", handlePointerDown);

    if (modeChangeTimeout) {
      clearTimeout(modeChangeTimeout);
    }
  };

  // Setup listeners immediately
  setupListeners();

  // Cleanup on component unmount
  onUnmounted(() => {
    cleanupListeners();
  });

  return {
    isTouchMode,
  };
};
