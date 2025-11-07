import { vi } from "vitest";

// Mock localStorage globally before any test files or their dependencies are loaded
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: vi.fn((key: string) => {
      // Default to 'false' for 'isLoggedIn' or null for other keys.
      if (key === "isLoggedIn") return "false";
      return null;
    }),
    setItem: vi.fn(() => {}),
    removeItem: vi.fn(() => {}),
  },
  writable: true,
});
