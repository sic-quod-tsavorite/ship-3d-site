// Imports
import { ref, computed, watch } from "vue";
import type { Ref, ComputedRef } from "vue";

// Constants
const HOVER_ZONE_WIDTH = 350;
const GLOW_TIMEOUT_MS = 10000;

interface UseNavigationStateReturn {
  // State
  isLocked: Ref<boolean>;
  isHovering: Ref<boolean>;
  isVisible: ComputedRef<boolean>;
  showGlowAnimation: Ref<boolean>;
  hasEntered: Ref<boolean>;
  // Handlers
  toggleLock: () => void;
  handleContainerEnter: () => void;
  handleContainerLeave: () => void;
  handleMouseMove: (e: MouseEvent) => void;
  // Lifecycle
  setupMouseTracking: () => void;
  cleanupMouseTracking: () => void;
  triggerEntranceAnimation: () => void;
  startGlowTimeout: () => void;
}

export const useNavigationState = (): UseNavigationStateReturn => {
  // State refs
  const isLocked = ref(false);
  const isHovering = ref(false);
  const showGlowAnimation = ref(true);
  const hasEntered = ref(false);

  // Navigation is visible when locked OR when hovering
  const isVisible = computed<boolean>(() => isLocked.value || isHovering.value);

  // Glow timeout handle
  let glowTimeout: ReturnType<typeof setTimeout> | null = null;

  // Stop glow animation
  const stopGlowAnimation = (): void => {
    showGlowAnimation.value = false;
  };

  // Stop animation when navigation becomes visible
  watch(isVisible, (visible) => {
    if (visible && showGlowAnimation.value) {
      stopGlowAnimation();
    }
  });

  // Track mouse position for hover zone detection
  const handleMouseMove = (e: MouseEvent): void => {
    if (isLocked.value) return;

    const isInHoverZone = e.clientX <= HOVER_ZONE_WIDTH;
    if (isInHoverZone && !isHovering.value) {
      isHovering.value = true;
    } else if (!isInHoverZone && isHovering.value) {
      isHovering.value = false;
    }
  };

  // Toggle lock state
  const toggleLock = (): void => {
    isLocked.value = !isLocked.value;
  };

  // Container hover handlers (to keep nav open while interacting with it)
  const handleContainerEnter = (): void => {
    if (!isLocked.value) {
      isHovering.value = true;
    }
  };

  const handleContainerLeave = (): void => {
    if (!isLocked.value) {
      isHovering.value = false;
    }
  };

  // Lifecycle: setup mouse tracking
  const setupMouseTracking = (): void => {
    document.addEventListener("mousemove", handleMouseMove);
  };

  // Lifecycle: cleanup mouse tracking
  const cleanupMouseTracking = (): void => {
    document.removeEventListener("mousemove", handleMouseMove);
    if (glowTimeout) {
      clearTimeout(glowTimeout);
    }
  };

  // Lifecycle: trigger entrance animation after initial render
  const triggerEntranceAnimation = (): void => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        hasEntered.value = true;
      });
    });
  };

  // Lifecycle: start glow timeout (auto-stop after 10s)
  const startGlowTimeout = (): void => {
    glowTimeout = setTimeout(() => {
      stopGlowAnimation();
    }, GLOW_TIMEOUT_MS);
  };

  return {
    // State
    isLocked,
    isHovering,
    isVisible,
    showGlowAnimation,
    hasEntered,
    // Handlers
    toggleLock,
    handleContainerEnter,
    handleContainerLeave,
    handleMouseMove,
    // Lifecycle
    setupMouseTracking,
    cleanupMouseTracking,
    triggerEntranceAnimation,
    startGlowTimeout,
  };
};
