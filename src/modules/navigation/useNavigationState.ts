// Imports
import { ref, computed, watch, watchEffect } from "vue";
import type { Ref, ComputedRef } from "vue";
import { useInputMode } from "./useInputMode";

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
  isTouchMode: Ref<boolean>;
  isOpen: Ref<boolean>;
  // Handlers
  toggleLock: () => void;
  handleContainerEnter: () => void;
  handleContainerLeave: () => void;
  handleMouseMove: (e: MouseEvent) => void;
  closeNavigation: () => void;
  handleClickOutside: (
    event: MouseEvent,
    navContainer: HTMLElement | null,
    toggleButton: HTMLElement | null
  ) => void;
  handleNavLinkClick: () => void;
  setupClickListeners: (
    navContainerRef: Ref<HTMLElement | null>,
    toggleButtonRef: Ref<HTMLElement | null>
  ) => () => void;
  // Lifecycle
  setupMouseTracking: () => void;
  cleanupMouseTracking: () => void;
  triggerEntranceAnimation: () => void;
  startGlowTimeout: () => void;
}

export const useNavigationState = (): UseNavigationStateReturn => {
  // Get touch mode detection
  const { isTouchMode } = useInputMode();

  // State refs
  const isLocked = ref(false);
  const isHovering = ref(false);
  const isOpen = ref(false);
  const showGlowAnimation = ref(true);
  const hasEntered = ref(false);

  // Navigation is visible based on input mode
  const isVisible = computed<boolean>(() => {
    if (isTouchMode.value) {
      return isOpen.value; // Touch mode: simple open/close
    }
    return isLocked.value || isHovering.value; // Mouse mode: hover + lock
  });

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

  // Watch for input mode changes - setup/cleanup mouse tracking accordingly
  watch(isTouchMode, (touchMode) => {
    if (touchMode) {
      cleanupMouseTracking();
    } else {
      setupMouseTracking();
    }
  });

  // Preserve state when switching between touch and mouse modes
  watch(isTouchMode, (newTouchMode, oldTouchMode) => {
    // When switching from touch to mouse mode
    if (oldTouchMode === true && !newTouchMode) {
      // Preserve open state as locked state
      if (isOpen.value) {
        isLocked.value = true;
        isOpen.value = false;
      }
    }
    // When switching from mouse to touch mode
    else if (oldTouchMode === false && newTouchMode) {
      // Preserve visibility as open state
      const wasVisible = isLocked.value || isHovering.value;
      if (wasVisible) {
        isOpen.value = true;
      }
      isLocked.value = false;
      isHovering.value = false;
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

  // Toggle lock state (mode-aware)
  const toggleLock = (): void => {
    if (isTouchMode.value) {
      isOpen.value = !isOpen.value; // Touch mode: toggle open/close
    } else {
      isLocked.value = !isLocked.value; // Mouse mode: toggle lock
    }
  };

  // Close navigation (touch mode only)
  const closeNavigation = (): void => {
    if (isTouchMode.value && isOpen.value) {
      isOpen.value = false;
    }
  };

  // Click-outside handler for touch mode
  const handleClickOutside = (
    event: MouseEvent,
    navContainer: HTMLElement | null,
    toggleButton: HTMLElement | null
  ): void => {
    if (!isTouchMode.value || !isVisible.value) return;

    const target = event.target as Node;

    // Close if click is outside both nav container and toggle button
    if (
      navContainer &&
      toggleButton &&
      !navContainer.contains(target) &&
      !toggleButton.contains(target)
    ) {
      closeNavigation();
    }
  };

  // Close navigation on link click (touch mode only)
  const handleNavLinkClick = (): void => {
    closeNavigation();
  };

  // Setup click-outside listener lifecycle
  const setupClickListeners = (
    navContainerRef: Ref<HTMLElement | null>,
    toggleButtonRef: Ref<HTMLElement | null>
  ): (() => void) => {
    // Return a cleanup function
    return () => {
      watchEffect((onCleanup) => {
        if (isTouchMode.value && isVisible.value) {
          // Use setTimeout to avoid immediate closure from the click that opened it
          const timeoutId = setTimeout(() => {
            const handleClick = (event: MouseEvent): void => {
              handleClickOutside(
                event,
                navContainerRef.value,
                toggleButtonRef.value
              );
            };
            document.addEventListener("click", handleClick);

            onCleanup(() => {
              document.removeEventListener("click", handleClick);
            });
          }, 0);

          onCleanup(() => {
            clearTimeout(timeoutId);
          });
        }
      });
    };
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
    if (isTouchMode.value) return; // Skip in touch mode
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
    isTouchMode,
    isOpen,
    // Handlers
    toggleLock,
    handleContainerEnter,
    handleContainerLeave,
    handleMouseMove,
    closeNavigation,
    handleClickOutside,
    handleNavLinkClick,
    setupClickListeners,
    // Lifecycle
    setupMouseTracking,
    cleanupMouseTracking,
    triggerEntranceAnimation,
    startGlowTimeout,
  };
};
