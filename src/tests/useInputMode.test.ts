import { describe, it, expect, beforeEach, vi } from "vitest";
import { useInputMode } from "@/modules/navigation/useInputMode";

describe("useInputMode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with touch mode based on matchMedia", (): void => {
    // Mock matchMedia to return true (touch-capable device)
    const mockMatchMedia = vi.fn(() => ({
      matches: true,
      media: "(pointer: coarse)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    window.matchMedia = mockMatchMedia;

    const { isTouchMode } = useInputMode();
    expect(isTouchMode.value).toBe(true);
  });

  it("initializes with mouse mode when matchMedia returns false", (): void => {
    // Mock matchMedia to return false (fine pointer device)
    const mockMatchMedia = vi.fn(() => ({
      matches: false,
      media: "(pointer: coarse)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    window.matchMedia = mockMatchMedia;

    const { isTouchMode } = useInputMode();
    expect(isTouchMode.value).toBe(false);
  });

  it("returns isTouchMode as a reactive ref", (): void => {
    const mockMatchMedia = vi.fn(() => ({
      matches: false,
      media: "(pointer: coarse)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    window.matchMedia = mockMatchMedia;

    const { isTouchMode } = useInputMode();

    // Verify it's reactive
    expect(isTouchMode).toHaveProperty("value");
    expect(typeof isTouchMode.value).toBe("boolean");
  });

  it("sets up event listeners on creation", (): void => {
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");

    const mockMatchMedia = vi.fn(() => ({
      matches: false,
      media: "(pointer: coarse)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    window.matchMedia = mockMatchMedia;

    useInputMode();

    // Verify listeners were added
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "touchstart",
      expect.any(Function),
      expect.objectContaining({ passive: true })
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "mousemove",
      expect.any(Function),
      expect.objectContaining({ passive: true })
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "pointerdown",
      expect.any(Function)
    );

    addEventListenerSpy.mockRestore();
  });

  it("initializes without errors in browser-like environment", (): void => {
    const mockMatchMedia = vi.fn(() => ({
      matches: true,
      media: "(pointer: coarse)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    window.matchMedia = mockMatchMedia;

    // Should not throw
    expect(() => {
      useInputMode();
    }).not.toThrow();
  });

  it("handles missing matchMedia gracefully", (): void => {
    const originalMatchMedia = window.matchMedia;
    // @ts-expect-error Testing graceful fallback
    window.matchMedia = undefined;

    // Mock as a function that throws to simulate missing matchMedia
    window.matchMedia = vi.fn(() => {
      throw new Error("matchMedia not supported");
    });

    // Should handle error gracefully by catching it
    expect(() => {
      useInputMode();
    }).not.toThrow();

    window.matchMedia = originalMatchMedia;
  });
});
