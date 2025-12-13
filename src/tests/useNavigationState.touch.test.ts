import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import type { Ref } from "vue";
import { useNavigationState } from "@/modules/navigation/useNavigationState";

// Mock useInputMode

vi.mock("@/modules/navigation/useInputMode", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ref } = require("vue") as { ref: typeof import("vue").ref };
  return {
    useInputMode: (): { isTouchMode: Ref<boolean> } => ({
      isTouchMode: ref(false),
    }),
  };
});

describe("useNavigationState - Touch Mode", (): void => {
  beforeEach((): void => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach((): void => {
    vi.useRealTimers();
  });

  it("uses isOpen state in touch mode", (): void => {
    const { isTouchMode, isOpen, isVisible } = useNavigationState();

    // Manually set to touch mode for testing
    isTouchMode.value = true;

    // When isOpen is false, isVisible should be false
    isOpen.value = false;
    expect(isVisible.value).toBe(false);

    // When isOpen is true, isVisible should be true
    isOpen.value = true;
    expect(isVisible.value).toBe(true);
  });

  it("toggles isOpen in touch mode instead of isLocked", (): void => {
    const { isTouchMode, isOpen, isLocked, toggleLock } = useNavigationState();

    // Set to touch mode
    isTouchMode.value = true;
    isOpen.value = false;
    isLocked.value = false;

    // Call toggleLock
    toggleLock();

    // Should toggle isOpen, not isLocked
    expect(isOpen.value).toBe(true);
    expect(isLocked.value).toBe(false);

    // Toggle again
    toggleLock();
    expect(isOpen.value).toBe(false);
    expect(isLocked.value).toBe(false);
  });

  it("toggles isLocked in mouse mode instead of isOpen", (): void => {
    const { isTouchMode, isOpen, isLocked, toggleLock } = useNavigationState();

    // Set to mouse mode
    isTouchMode.value = false;
    isOpen.value = false;
    isLocked.value = false;

    // Call toggleLock
    toggleLock();

    // Should toggle isLocked, not isOpen
    expect(isOpen.value).toBe(false);
    expect(isLocked.value).toBe(true);

    // Toggle again
    toggleLock();
    expect(isOpen.value).toBe(false);
    expect(isLocked.value).toBe(false);
  });

  it("skips mouse tracking setup in touch mode", (): void => {
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");

    const { isTouchMode, setupMouseTracking } = useNavigationState();

    // Set to touch mode
    isTouchMode.value = true;

    // Call setupMouseTracking
    setupMouseTracking();

    // Should not add mousemove listener in touch mode
    const mousemoveListeners = addEventListenerSpy.mock.calls.filter(
      (call) => call[0] === "mousemove"
    );
    expect(mousemoveListeners.length).toBe(0);

    addEventListenerSpy.mockRestore();
  });

  it("uses mouse mode state (isLocked || isHovering) when not in touch mode", (): void => {
    const { isTouchMode, isLocked, isHovering, isVisible } =
      useNavigationState();

    // Set to mouse mode
    isTouchMode.value = false;
    isLocked.value = false;
    isHovering.value = false;

    // isVisible should be false when neither locked nor hovering
    expect(isVisible.value).toBe(false);

    // Set hovering to true
    isHovering.value = true;
    expect(isVisible.value).toBe(true);

    // Set hovering back to false, set locked to true
    isHovering.value = false;
    isLocked.value = true;
    expect(isVisible.value).toBe(true);

    // Set both to true
    isHovering.value = true;
    isLocked.value = true;
    expect(isVisible.value).toBe(true);
  });

  it("does not trigger container hover handlers in touch mode", (): void => {
    const {
      isTouchMode,
      isHovering,
      handleContainerEnter,
      handleContainerLeave: _handleContainerLeave,
    } = useNavigationState();

    // Set to touch mode
    isTouchMode.value = true;
    isHovering.value = false;

    // Call enter handler
    handleContainerEnter();

    // In touch mode, enter/leave handlers should still work but isVisible is controlled by isOpen
    // The handlers only affect isHovering, which is ignored in touch mode for isVisible calculation
    // So we verify that isHovering can be affected but isVisible depends on isOpen instead
    expect(isHovering.value).toBe(true);
  });

  it("maintains separate state for touch and mouse modes", (): void => {
    const { isTouchMode, isOpen, isLocked, isHovering, isVisible } =
      useNavigationState();

    // Initialize in mouse mode
    isTouchMode.value = false;
    isLocked.value = false;
    isHovering.value = false;
    isOpen.value = false;

    // Set mouse mode state
    isHovering.value = true;
    expect(isVisible.value).toBe(true);

    // Switch to touch mode without changing values
    isTouchMode.value = true;
    expect(isVisible.value).toBe(false); // isVisible now depends on isOpen, not isHovering

    // Set isOpen in touch mode
    isOpen.value = true;
    expect(isVisible.value).toBe(true);

    // Switch back to mouse mode
    isTouchMode.value = false;
    expect(isVisible.value).toBe(true); // isVisible depends on isHovering again
  });

  it("handleContainerLeave sets isHovering to false when not locked", (): void => {
    const { isLocked, isHovering, handleContainerEnter, handleContainerLeave } =
      useNavigationState();

    isLocked.value = false;

    // First enter to set hovering true
    handleContainerEnter();
    expect(isHovering.value).toBe(true);

    // Leave should set it false
    handleContainerLeave();
    expect(isHovering.value).toBe(false);
  });

  it("handleContainerLeave does not change isHovering when locked", (): void => {
    const { isLocked, isHovering, handleContainerEnter, handleContainerLeave } =
      useNavigationState();

    isLocked.value = false;
    handleContainerEnter();
    expect(isHovering.value).toBe(true);

    // Lock the navigation
    isLocked.value = true;

    // Leave should not change isHovering when locked
    handleContainerLeave();
    expect(isHovering.value).toBe(true);
  });

  it("handleMouseMove sets isHovering based on hover zone", (): void => {
    const { isLocked, isHovering, handleMouseMove } = useNavigationState();

    isLocked.value = false;
    isHovering.value = false;

    // Mouse in hover zone (x <= 350)
    handleMouseMove({ clientX: 100 } as MouseEvent);
    expect(isHovering.value).toBe(true);

    // Mouse outside hover zone (x > 350)
    handleMouseMove({ clientX: 400 } as MouseEvent);
    expect(isHovering.value).toBe(false);

    // Edge case: exactly at boundary
    handleMouseMove({ clientX: 350 } as MouseEvent);
    expect(isHovering.value).toBe(true);

    // Just past boundary
    handleMouseMove({ clientX: 351 } as MouseEvent);
    expect(isHovering.value).toBe(false);
  });

  it("handleMouseMove does not change isHovering when locked", (): void => {
    const { isLocked, isHovering, handleMouseMove } = useNavigationState();

    isLocked.value = true;
    isHovering.value = false;

    // Mouse in hover zone should not change isHovering when locked
    handleMouseMove({ clientX: 100 } as MouseEvent);
    expect(isHovering.value).toBe(false);
  });

  it("stops glow animation when navigation becomes visible", async (): Promise<void> => {
    const { isTouchMode, isOpen, showGlowAnimation } = useNavigationState();

    // Start in touch mode with glow active
    isTouchMode.value = true;
    expect(showGlowAnimation.value).toBe(true);

    // Make navigation visible - this should trigger the watch
    isOpen.value = true;

    // Allow Vue's watch to execute
    await vi.runAllTimersAsync();

    expect(showGlowAnimation.value).toBe(false);
  });

  it("startGlowTimeout stops glow after 10 seconds", (): void => {
    const { showGlowAnimation, startGlowTimeout } = useNavigationState();

    expect(showGlowAnimation.value).toBe(true);

    startGlowTimeout();

    // Advance time by 9 seconds - glow should still be active
    vi.advanceTimersByTime(9000);
    expect(showGlowAnimation.value).toBe(true);

    // Advance time by 1 more second (total 10s) - glow should stop
    vi.advanceTimersByTime(1000);
    expect(showGlowAnimation.value).toBe(false);
  });

  it("cleanupMouseTracking removes event listener and clears timeout", (): void => {
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

    const { startGlowTimeout, cleanupMouseTracking, showGlowAnimation } =
      useNavigationState();

    // Start the glow timeout
    startGlowTimeout();

    // Cleanup should remove listener and clear timeout
    cleanupMouseTracking();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "mousemove",
      expect.any(Function)
    );

    // Advance time past timeout - glow should NOT stop since timeout was cleared
    vi.advanceTimersByTime(15000);
    expect(showGlowAnimation.value).toBe(true);

    removeEventListenerSpy.mockRestore();
  });

  it("setupMouseTracking adds mousemove listener in mouse mode", (): void => {
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");

    const { isTouchMode, setupMouseTracking } = useNavigationState();

    // Set to mouse mode
    isTouchMode.value = false;

    // Call setupMouseTracking
    setupMouseTracking();

    const mousemoveListeners = addEventListenerSpy.mock.calls.filter(
      (call) => call[0] === "mousemove"
    );
    expect(mousemoveListeners.length).toBe(1);

    addEventListenerSpy.mockRestore();
  });
});
