import { vi } from "vitest";

// Mock localStorage globally before any test files or their dependencies are loaded
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: vi.fn((_key: string) => {
      return null;
    }),
    setItem: vi.fn(() => {}),
    removeItem: vi.fn(() => {}),
  },
  writable: true,
});
