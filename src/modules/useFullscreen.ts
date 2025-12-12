/**
 * Fullscreen management composable
 * Handles fullscreen state, keyboard shortcuts (F key), and browser events
 */

import { ref, onMounted, onUnmounted, type Ref } from "vue";

export interface UseFullscreenReturn {
  isFullscreen: Ref<boolean>;
  toggleFullscreen: () => void;
}

/**
 * Composable for managing fullscreen functionality
 * @param container - Reference to the HTML element to make fullscreen
 * @returns Fullscreen state and toggle function
 */
export const useFullscreen = (
  container: Ref<HTMLElement | null>
): UseFullscreenReturn => {
  const isFullscreen = ref<boolean>(false);

  /**
   * Requests fullscreen mode for the container element
   */
  const enterFullscreen = async (): Promise<void> => {
    if (container.value === null) {
      return;
    }

    try {
      if (!document.fullscreenEnabled) {
        console.warn("Fullscreen mode is not supported by this browser");
        return;
      }

      await container.value.requestFullscreen();
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : String(err);
      console.error("Failed to enter fullscreen:", error);
    }
  };

  /**
   * Exits fullscreen mode
   */
  const exitFullscreen = async (): Promise<void> => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Failed to exit fullscreen:", error);
    }
  };

  /**
   * Toggles fullscreen mode on/off
   */
  const toggleFullscreen = (): void => {
    if (isFullscreen.value) {
      void exitFullscreen();
    } else {
      void enterFullscreen();
    }
  };

  /**
   * Event handler for fullscreenchange event
   * Updates isFullscreen state based on current fullscreen element
   */
  const handleFullscreenChange = (): void => {
    isFullscreen.value = document.fullscreenElement === container.value;
  };

  /**
   * Keyboard event handler for F key
   * Toggles fullscreen when F or f is pressed
   */
  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "f" || event.key === "F") {
      event.preventDefault();
      toggleFullscreen();
    }
  };

  /**
   * Setup event listeners
   */
  onMounted((): void => {
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("keydown", handleKeyDown);
  });

  /**
   * Cleanup event listeners and exit fullscreen on unmount
   */
  onUnmounted((): void => {
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
    document.removeEventListener("keydown", handleKeyDown);

    if (document.fullscreenElement === container.value) {
      void exitFullscreen();
    }
  });

  return {
    isFullscreen,
    toggleFullscreen,
  };
};
